var chartCanvas = document.getElementById('myChart')
var chartctx = chartCanvas.getContext('2d');

var barChartCanvas = document.getElementById('myBarChart')
var barChartctx = barChartCanvas.getContext('2d');

var clipCheck = document.getElementById("clipCheck");
var lowClipSlider = document.getElementById("clipSlider");
var sliderValue = document.getElementById("clipSliderValue");
var clipData = true;
var choppingNumber = 0;

var normalizeCheck = document.getElementById("normalizeCheck");
var normalizeSlider = document.getElementById("normalizeSlider");
var normalizeSliderValue = document.getElementById("normalizeSliderValue");

var normalizeData = true;
var normalizeDataTo = 0;

Chart.defaults.global.animation.duration = 0;

lowClipSlider.oninput = function() {
  if(selectedCountryNames.length == 0)
    return;
  sliderValue.innerHTML = this.value;
  choppingNumber = this.value;

  updateGraph();
}

normalizeSlider.oninput = function() {
  normalizeSliderValue.innerHTML = this.value;
  normalizeDataTo = this.value;

  updateGraph();
}

$("#myBarChart").hide();
$("#error").hide();
//https://www.papaparse.com/docs#csv-to-json

var confirmedRaw;
var confirmedRawUS;
var statesTree = [];

var dataConfirmed;
var dataConfirmedOrdered = {};

var dataConfirmedUS;
var dataConfirmedUSOrdered = {};

var treeData = [];
var countryData = {};
var selectedCountryNames = [];
var myTree;

var chart;
var barChart;

var graphColors = ["#457482", "#F26671","#F2D230","#18D9A2","#905194","#b5eeff"];
var barGraphAlpha = "80";
var lastSelectedValues = [];
var maxSelections = 5;

var phantomSelections = [];
var selections = [];

var usDataComplete = false;
var countryDataComplete = false;

var isGraphLog = false;
var graphType = "line";

$(document).ready(function(){
  $('body').show();
  setGraphControlsEnabled(false);

  var USTreeDataIndex = 0;

  jQuery.get('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv', function(data) {
    confirmedRaw = data;

    Papa.parse(confirmedRaw, {
      delimiter: ",",
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        dataConfirmed = results.data;

        var numberOfCountries = Object.size(dataConfirmed);

        for (let i = 0; i < numberOfCountries - 1; i++) {
          var countryName = dataConfirmed[i]["Country/Region"];
      
          //countryData - puts data in an object with format {Afganistan: {}, ..., Australia:[{Australian Capital Territory},{New South Wales}, ...], ...}
          if(countryData[countryName] == null)
            countryData[countryName] = [dataConfirmed[i]]
          else
            countryData[countryName].push(dataConfirmed[i]); 
      
          var nameHolder;
      
          //Adding the data to an lsi with the keys set to the counrty name or the province if it is one - format {Afganistan: {1/22/20: 0, 1/23/20: 0, ...}}
          if(dataConfirmed[i]["Province/State"] == null)
          {
            dataConfirmedOrdered[countryName] = $.extend(true,{},dataConfirmed[i]);
            nameHolder = countryName
          }
          else
          {
            var provinceName = dataConfirmed[i]["Province/State"];
            dataConfirmedOrdered[provinceName] = $.extend(true,{},dataConfirmed[i]);
            nameHolder = provinceName;
          }
            
          delete dataConfirmedOrdered[nameHolder]["Province/State"];
          delete dataConfirmedOrdered[nameHolder]["Country/Region"];
          delete dataConfirmedOrdered[nameHolder]["Lat"];
          delete dataConfirmedOrdered[nameHolder]["Long"];
        }

        var countryNames = Object.keys(countryData);

        //Puts the data into an array with format: [{id: 0, text: "Afganistan", children: []}, ...]
        // This list contains NO data, it is purely for constructing the tree
        for (let i = 0; i < countryNames.length; i++) {
          var countryName = countryNames[i];
          var countryTreeData = {id: i.toString(), text: countryName, children: []}

          if(countryData[countryName].length > 1)
          {
            for(var pid = 0; pid < countryData[countryName].length; pid++){

              var province = countryData[countryName][pid];
              var provinceName = province["Province/State"];

              if(provinceName != null)
                countryTreeData.children.push({id: i + "-" + pid, text: provinceName});
            }
          }

          //Getting the index of the United States in order to populate it later
          if(countryName == "US")
            USTreeDataIndex = treeData.length;

          //Pushing the data to the global variable "treeData" so we can add to it later with the United States data
          treeData.push(countryTreeData);
        }

        countryDataComplete = true;
        attemptCreateTree();
      }
    });
  });

  jQuery.get('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv', function(data) {
    confirmedRawUS = data;

    Papa.parse(confirmedRawUS, {
      delimiter: ",",
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        dataConfirmedUS = results.data;

        //Adds the elements of the tree for the children of US: States and US Territories. These are added to improve the orginization of the tree
        treeData[USTreeDataIndex]["children"].push({id: USTreeDataIndex + "-" + 0, text: "States", children: []})
        treeData[USTreeDataIndex]["children"].push({id: USTreeDataIndex + "-" + 1, text: "US Territories", children: []})

        //Selects the elements that were just created
        var territoriesTree = treeData[USTreeDataIndex]["children"][1]["children"];
        var statesTree = treeData[USTreeDataIndex]["children"][0]["children"];

        //This object will take the format of {USStateName1: [USCityName1, USCityName2, ...], ...}
        //It will be used to easily create the ordered tree view object in order to instantiate the tree view.
        var sortedStates = {};

        for (let i = 0; i < dataConfirmedUS.length - 1; i++) {
          const place = dataConfirmedUS[i];

          if(place["iso2"] == "US") //the place is a state or a city
          {
            var stateName = place["Province_State"];
            var cityName = place["Admin2"];
            
            var orderedData = orderPlace(place); //The data of the city, in the format {1/22/20: 0, 1/23/20: 0, ...}
            dataConfirmedOrdered[cityName] = orderedData;

            // // The data for the entire state
            // if(cityName == "Unassigned")
            //   dataConfirmedOrdered[stateName] = orderedData;

            if(sortedStates[stateName] == null) //If the state is not in the obj. add it with the city in a list eg. {Alabama: [{Autauga}]}
              sortedStates[stateName] = [cityName]
            else
              sortedStates[stateName].push(cityName);
          } 
          else // the place is a territory
          {
            var territoryName = place["Province_State"];
            var territoryIndex = territoriesTree.length;
            territoriesTree.push({id: USTreeDataIndex + "-" + 1 + "-" + territoryIndex, text: territoryName})

            var ordererTerritory = orderPlace(place);
            dataConfirmedOrdered[territoryName] = ordererTerritory;
          }
        }

        // Put the cities and states into an object with a format readable to the tree: {id: treeId eg. 1-3-4, text: stateName, children: [ (this structure repeats inside here) ]}

        var stateNames = Object.keys(sortedStates);

        for (let i = 0; i < stateNames.length; i++) {
          const stateName = stateNames[i];
          var stateId =  USTreeDataIndex + "-" + 0 + "-" + i;
          statesTree.push({id: stateId, text: stateName, children: []});

          var cities = sortedStates[stateName];

          for (let x = 0; x < cities.length; x++) {
            var cityName = cities[x];
            var cityId = USTreeDataIndex + "-" + 0 + "-" + i + "-" + x;
            statesTree[i].children.push({id: cityId, text: cityName});
          }
        }

        usDataComplete = true;
        attemptCreateTree();
      }
    });
  });

  chart = new Chart(chartctx, {
    type: "line",
    data: {
        labels: "",
        datasets: []
    },
    options: {
      scales: {
          yAxes: [{
            ticks: {
                beginAtZero: true
            }
          }]
      },
      elements: {
        line: {
            tension: .15 // disables bezier curves
        }
    }
    } 
  });

  barChart = new Chart(barChartctx, {
    type: "bar",
    data: {
        labels: "",
        datasets: []
    },
    options: {
      scales: {
          yAxes: [{
            ticks: {
                beginAtZero: true
            }
          }]
      }
    },
    elements: {
      line: {
          tension: .0 // disables bezier curves
      }
  }
  });

});


// Tree Creation ------------------------------------------------------
function attemptCreateTree()
{
  if(usDataComplete && countryDataComplete)
  {
    giveDataToEmptyWithChildren(treeData);
    createTree();
  }
}

function createTree()
{
  var html = treeHTMLMaker(treeData, "id=\"myUL\"", "treeItem-");
  $("#tree").html(html);
  setupTreeFunctions();
}

function treeHTMLMaker (treeData, identifier, level){

  html = "<ul " + identifier + ">";

  for (let i = 0; i < treeData.length; i++) {
    html += "<li id=\"" + level + i + "\"><span class=\"box\">" + treeData[i].text + "</span>"
    
    const countryChildren = treeData[i].children;

    if(countryChildren != null && countryChildren.length > 1)
      html += treeHTMLMaker(countryChildren, "class=\"nested\"", level + i + "-") + "</li>";
  }

  html += "</ul>";
  return html;
}

// Tree functions ------------------

function setupTreeFunctions() {
  var toggler = document.getElementsByClassName("box");
  var i;

  for (i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function() {
      var children = this.parentElement.querySelector(".nested");

      if(children)
        children.classList.toggle("activeTree");

      this.classList.toggle("check-box");

      var selectionName = this.innerHTML;
      var wasSelected = findInListByName(selectionName, selections) || findInListByName(selectionName, phantomSelections);
      var isTopLevel = this.parentElement.parentElement.id == "myUL";
        
      var parent = isTopLevel
      ? null
      : findInListByName(this.parentElement.parentElement.parentElement.querySelector("span").innerHTML, selections);

      var phantomParent = isTopLevel
      ? null
      : findInListByName(this.parentElement.parentElement.parentElement.querySelector("span").innerHTML, phantomSelections);

      if(wasSelected == null) //this has just been checked
      {

        if(parent != null && phantomParent == null) //If there is a parent and it is not already in the storage array, add it to the storage array
        {
          phantomSelections.push(parent);
          phantomParent = phantomSelections[phantomSelections.length - 1];
          
          removeFromListByName(parent.name, selections);
        }

        var newSelection = addSelection(selectionName, [], phantomParent, this.parentElement.id);

        if(phantomParent != null)
          phantomParent.children.push(newSelection);

      }
      else //wasSelected has just been unchecked
      {
        removeChildSelections(wasSelected);

        if(phantomParent != null) //if the selection is not top level and there will be no siblings currently selected -> select parent
        {
          removeFromListByName(wasSelected.name, phantomParent.children);

          if(phantomParent.children.length == 0)
          {
            //Move from phantomSelections to selections

            selections.push(phantomParent); 
            removeFromListByName(phantomParent.name, phantomSelections);
          }
        }

        removeFromListByName(wasSelected.name, selections);
        removeFromListByName(wasSelected.name, phantomSelections);
      }

      updateSelections();
    });
  }
}

function removeChildSelections(obj){

  obj.children.forEach(child => {

    if(obj.children.length > 0)
      removeChildSelections(child)

    var element = document.getElementById(child.elementID);
    var childrenElements = element.querySelector("ul");
    var spanElement = element.querySelector("span");

    if(childrenElements != null)
      childrenElements.classList.remove("activeTree");

    spanElement.classList.remove("check-box");

    var isPhantom = findInListByName(child.name, phantomSelections) != null;
    if (isPhantom) removeFromListByName(child.name, phantomSelections);
    
    var isSelected = findInListByName(child.name, selections) != null;
    if (isSelected) removeFromListByName(child.name, selections);

  });

}

function removeFromListByName(name, listRef){
  for (let i = listRef.length - 1; i >= 0; i--) {
    const selection = listRef[i];
    
    if(selection.name == name)
      listRef.splice(i, 1);
  }
}

function findInListByName(name, listRef)
{
  for (let i = 0; i < listRef.length; i++) {
    const selection = listRef[i];
    
    if(selection.name == name)
      return selection;
  }
}

function addSelection(name, children, parentRef, elementID)
{
  selections.push({name: name, children: children, parentRef: parentRef, elementID: elementID});
  return selections[selections.length - 1];
}

function clearTree()
{
  var allBoxes = $("li").map(function() {
    var childrenElements = this.querySelector("ul");
    var spanElement = this.querySelector("span");

    if(childrenElements != null)
      childrenElements.classList.remove("activeTree");

    spanElement.classList.remove("check-box");
}).get();

  selections = [];
  updateSelections();
}
// -------------------------------------------------------------------

// Filling in holes in the data ----------------
function giveDataToEmptyWithChildren(startingPoint)
{

  for (let i = 0; i < startingPoint.length; i++) {
    const treeElement = startingPoint[i];

    if(treeElement.children && treeElement.children.length > 0)
      giveDataToEmptyWithChildren(treeElement.children);

    if(!dataConfirmedOrdered[treeElement.text])
      dataConfirmedOrdered[treeElement.text] = addUpChildData(treeElement);
  }
}

function addUpChildData(obj)
{
  var returnData = {};

  for(var i = 0; i < obj.children.length; i++)
  {
    child = obj.children[i];
    var data = dataConfirmedOrdered[child.text];

    var childData = child.children && child.children.length > 0 
      ? addUpChildData(child)
      : {};

    Object.assign(data, childData);

    var dataKeys = Object.keys(data);

    for (let x = 0; x < dataKeys.length; x++) {
      const key = dataKeys[x];

      if(returnData[key] == null)
        returnData[key] = data[key];  
      else
        returnData[key] += data[key];  
    }

  }

  return returnData;
}
// --------------------------------------------

function orderPlace(objRef)
{

  var obj = $.extend(true,{},objRef);

  delete obj["UID"];
  delete obj["iso2"];
  delete obj["iso3"];
  delete obj["code3"];
  delete obj["FIPS"];
  delete obj["Admin2"];
  delete obj["Province_State"];
  delete obj["Country_Region"];
  delete obj["Lat"];
  delete obj["Long_"];
  delete obj["Combined_Key"];

  return obj;
}

// Graph Functionality -----------------------------------------------
function updateSelections(){

  selectedCountryNames = [];

  selections.forEach(selection => {
    selectedCountryNames.push(selection.name);
  });

  updateGraph();

}

function setGraphControlsEnabled(enabled)
{
  clipCheck.disabled = !enabled;
  lowClipSlider.disabled = !enabled;

  normalizeCheck.disabled = !enabled;
  normalizeSlider.disabled = !enabled
}

function updateGraph()
{
  if(selectedCountryNames.length > 0)
  {
    setGraphControlsEnabled(true);
    changeGraphType(isGraphLog, graphType);
  }
  else
  {
    setGraphControlsEnabled(false);
    plot([{values:[], labels:[]}], graphType, isGraphLog);
  }
}

function switchNormalize(){
  normalizeData = normalizeCheck.checked;

  var slider = $("#normalizeSlider");
  var value = $("#normalizeSliderValue");

  if(normalizeCheck.checked)
  {    
    slider.show();
    value.show();
  }
  else
  {
    slider.hide();
    value.hide();
  }

  updateGraph();
}

function toggleClipping(){
  clipData = clipCheck.checked;

  var slider = $("#clipSlider");
  var value = $("#clipSliderValue");

  if(clipCheck.checked)
  {    
    slider.show();
    value.show();
  }
  else
  {
    slider.hide();
    value.hide();
  }

  updateGraph();
}

function changeGraphType(isLog, type){

  var plotData = [];

  if(type == "line")
  {
    $("#myChart").show();
    $("#myBarChart").hide();
  }
  else
  {
    $("#myChart").hide();
    $("#myBarChart").show();
  }

  selectedCountryNames.forEach(name => {

    var labels = Object.keys(dataConfirmedOrdered[name]);
    var values = Object.values(dataConfirmedOrdered[name]);

    newPlotData = {country: name, labels:labels, data: []};

    //get cases per day instead of normal total cases
    if(!type == "line")
    {
      var previousValue = values[0];

      for (let i = 1; i < values.length; i++) {
        var value = values[i];
        newPlotData.data.push(value - previousValue);
        previousValue = value;
      }
    }
    else
      newPlotData.values = values;

    plotData.push(newPlotData);
  });

  plot(plotData, type, isLog);
}

function clickTab(evt, tabName) {
  var tabs = document.getElementsByClassName("tabs");

  for (var i = 0; i < tabs.length; i++) {
    tabs[i].className = tabs[i].className.replace(" activeTab", "");
  }

  evt.currentTarget.className += " activeTab";

  var isLog = tabName.substring(0, 3) == "log";
  var type;

  if(isLog)
    type = tabName.substring(3, tabName.length);
  else
    type = tabName;

  isGraphLog = isLog;
  graphType = type;

  changeGraphType(isLog, type)
}
// ------------------------------------------------------------------

var lineWidth = 5;

//graphData format: [{values:[], labels:[]}, ...]
function plot(graphData, type, isLog) {
  var datasets = [];
  var maxValue = 0;

  if (graphData.length == 0)
    return;


  if(normalizeData)
  {
    for (let i = 0; i < graphData.length; i++) {
      const data = graphData[i];
      
      var wasClipped = false;

      for (let x = 0; x < data.values.length; x++) {
        const val = data.values[x];

        if(val >= normalizeDataTo)
        {
          graphData[i].values.splice(0, x);
          graphData[i].normalizedTo = x;
          wasClipped = true;
          break;
        }
      }

      if(!wasClipped)
        graphData[i].values = [];
    }
  }

  var futhrestLeftNonZero = graphData[0].values.length;
  var isLineGraph = graphType == "line"

  for (let i = 0; i < graphData.length; i++) {
    const data = graphData[i];

    var newData = {
      label: 'Confirmed Cases: ' + data.country,
      data: data.values,
      normalizedTo: data.normalizedTo
    }

    if(!isLineGraph)
    {
      newData.backgroundColor = graphColors[i] + barGraphAlpha;
    }
    else
    {
      newData.borderColor = graphColors[i];
      newData.fill = false;
      newData.borderWidth = lineWidth;
    }

    datasets.push(newData)

    for (let x = 0; x < data.values.length; x++) {
      const val = data.values[x];
      if(val > maxValue)
        maxValue = val;

      if(val > choppingNumber && x < futhrestLeftNonZero)
        futhrestLeftNonZero = x;
    }
  }

  lowClipSlider.max = Math.round(maxValue * .8);
  normalizeSlider.max = Math.round(maxValue * .8);

  if(clipData)
  {
    graphData[0].labels = graphData[0].labels.slice(futhrestLeftNonZero, graphData[0].labels.length);

    for(let i = 0; i < datasets.length; i++)
    {
      datasets[i].data = datasets[i].data.slice(futhrestLeftNonZero, datasets[i].data.length);
    }
  }

  yAxes = [{
    ticks: {
        beginAtZero: true
    }
  }];

  if(isLog)
    yAxes = [{
      type: 'logarithmic'
  }];

  var setChart;

  if(type == "line")
    setChart = chart;
  else if(type == "bar")
    setChart = barChart;

  var dateInterval = 5;

  //removes dates from x axis if the user chooses to normalize the data and there are more than one countries being represented
  if(normalizeData && selectedCountryNames.length > 1)
    dateInterval = 0;

  if(!isLineGraph)
  {
    //add moving average
    var averageInterval = 5;
    averageDatasets = [];

    for(let i = 0; i < datasets.length; i++)
    {
      var averageData = [];
      var total = 0;
      var interval = 0;
      var dates =[];

      for(var x = 0; x < datasets[i].data.length; x++)
      {
        total += datasets[i].data[x];
        interval++;

        if(x % averageInterval == 0 || x == datasets[i].data.length - 1)
        {
          average = x == 0
            ? total
            : total / interval  
            
          averageData.push({x: graphData[i].labels[x], y: average});
          total = 0;
          interval = 0
          dates.push(graphData[i].labels[x]);
        }
      }  
      
      averageDatasets.push({label: datasets[i].label + " average", data: averageData, type: "line", borderWidth: lineWidth, fill: false, borderColor: graphColors[i], isAverage: true, dates: dates});
    }
  
    datasets = datasets.concat(averageDatasets);
  }

  //Set data tooltips
  setChart.options.tooltips.callbacks = {title: function(tooltipItems, data)
  {
    var label = tooltipItems[0].label;
    if(data.datasets[tooltipItems[0].datasetIndex].isAverage)
      label = data.datasets[tooltipItems[0].datasetIndex].dates[tooltipItems[0].index];
    else if(normalizeData)
    {
      var normalizedTo = data.datasets[tooltipItems[0].datasetIndex].normalizedTo;
      label =  data.labels[normalizedTo + tooltipItems[0].index];
    }
    
    return 'Date: ' + label;
  }};
  
  setChart.options.legend.display = !normalizeData;
  setChart.data.labels = graphData[0].labels;
  setChart.data.datasets = datasets;
  setChart.update();

  setChart.options.scales = {
    yAxes: yAxes,
    xAxes: [{
      ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          display: !normalizeData || (normalizeData && datasets.length <= 1)
      }
    }]
  };
  setChart.update();
  // setChart.type = type;
  // setChart.update();
}

//Search Functions ---------------------------

function levenshteinDistance (a, b){
  if(a.length == 0) return b.length; 
  if(b.length == 0) return a.length; 

  var matrix = [];

  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                          matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};

function findClosestCountryName(name)
{
    var shortestDistance =  levenshteinDistance(countries[0], name);
    var closestCountryName = countries[0];

    for (let i = 1; i < numberOfCountries; i++) {
        var distance = levenshteinDistance(countries[i], name);

        if(distance < shortestDistance)
        {
            shortestDistance = distance
            closestCountryName = countries[i];
        }
    }

    return closestCountryName;   
}

//Sidebar Navigation
function openNav() {
  document.getElementById("treeContainer").style.width = "80%";
}
function closeNav() {
  document.getElementById("treeContainer").style.width = "0";
}

$(window).resize(function(){
  if($( window ).width()  >= 750)
    document.getElementById("treeContainer").style.width = "20%";
  else
    document.getElementById("treeContainer").style.width = "0"
});

// Utility Functions ------------------------

Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};
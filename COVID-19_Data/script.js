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

var caretSelections = [];
var selections = [];

var usDataComplete = false;
var countryDataComplete = false;

var isGraphLog = false;
var graphType = "line";

$(document).ready(function(){
  $('body').show();
  setGraphControlsEnabled(false);

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

        var USTreeDataIndex = 0;

        for (let i = 0; i < treeData.length; i++) {
          const name = treeData[i].text;
          if(name == "US")
          {
            USTreeDataIndex = i;
            break;
          }
        }

        if(treeData[USTreeDataIndex] == null)
          treeData[USTreeDataIndex] = {id: 0, text: "United States", children: []};

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
            tension: 0 // disables bezier curves
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
      },
      elements: {
        line: {
            tension: 0 // disables bezier curves
        }
    },
  }
  });

});

var returnEntries = 50;

//Sorted Tree Creation

$( "#searchBar" ).keyup(function() {

  if(this.value != "")
    createSortedTree(this.value);
  else
  {
    $("#sortedTree").hide();
    $("#tree").show();
  }

});

function updateSelectionsTree()
{
  if(selectedCountryNames.length == 0)
    $("#selectionsTree").hide();
  else
    $("#selectionsTree").show();

  var selectionData = [];

  selectedCountryNames.forEach(selection => {
    selectionData.push({text:selection})
  });

  var selectionHtml = treeHTMLMaker(selectionData, "id=\"myUL\"", "treeItem-");
  
  $("#selectionsTree").html(selectionHtml);
  setupTreeFunctions(document.getElementById("selectionsTree"));
}

function createSortedTree(name)
{
  sortedTreeData = closestNames(name).slice(0, returnEntries);

  var html = treeHTMLMaker(sortedTreeData, "id=\"myUL\"", "treeItem-");

  $("#sortedTree").html(html);

  $("#tree").hide();
  $("#sortedTree").show();

  updateSelectionsTree();
  setupTreeFunctions(document.getElementById("sortedTree"));
}

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

  $("#tree").show();
  $("#sortedTree").hide();

  updateSelectionsTree();
  setupTreeFunctions(document.getElementById("tree"));
}

function treeHTMLMaker (treeData, identifier, level){

  html = "<ul " + identifier + ">";

  for (let i = 0; i < treeData.length; i++) {

    var spanClass = "box";
    var selected = false;

    for (let x = 0; x < selectedCountryNames.length; x++) {
      const selection = selectedCountryNames[x];
     
      if(selection == treeData[i].text)
      {
        selected = true;
        break;
      }
    }

    if(selected)
      spanClass += " check-box"


    const countryChildren = treeData[i].children;
    var hasChildren = (countryChildren != null && countryChildren.length > 1);

    html += "<li id=\"" + level + i + "\">";

    if(hasChildren)
    {
      html += "<span class=\" caret \"></span>";
      spanClass += " withCaret";
    }
    
    html += "<span class=\"" + spanClass +"\">" + treeData[i].text + "</span>";
    
    if(hasChildren)
      html += treeHTMLMaker(countryChildren, "class=\"nested\"", level + i + "-") + "</li>";
  }

  html += "</ul>";
  return html;
}

// Tree functions ------------------
function setupTreeFunctions(treeDOMObject) {
  var boxToggler = treeDOMObject.getElementsByClassName("box");
  var caretToggler = treeDOMObject.getElementsByClassName("caret");
  var i;

  for (i = 0; i < caretToggler.length; i++) {
    caretToggler[i].addEventListener("click", function() {
      var children = this.parentElement.querySelector(".nested");
      children.classList.toggle("activeTree");
      this.classList.toggle("caret-down");
    });
  }

  for (i = 0; i < boxToggler.length; i++) {
    boxToggler[i].addEventListener("click", function() {

      this.classList.toggle("check-box");

      var selectionName = this.innerHTML;
      var wasSelected = selectedCountryNames.indexOf(selectionName);
      
      if(wasSelected == -1)             // has just been checked
        selectedCountryNames.push(selectionName);
      else                                // has just been unchecked
        selectedCountryNames.splice(selectedCountryNames.indexOf(selectionName), 1);

      //we are currently using searchbox, reload the tree to update selections
      if($("#searchBar").val() != "")
        createSortedTree($("#searchBar").val());
        
      updateSelectionsTree();
      createTree();
      updateGraph();
    });
  }
}

function removeFromListByName(name, listRef){
  for (let i = listRef.length - 1; i >= 0; i--) {
    const selection = listRef[i];
    
    if(selection == name)
      listRef.splice(i, 1);
  }
}

function findInListByName(name, listRef)
{
  for (let i = 0; i < listRef.length; i++) {
    const selection = listRef[i];
    
    if(selection == name)
      return selection;
  }
}

function clearTree()
{
  var allBoxes = $("li").map(function() {
    var childrenElements = this.querySelector("ul");
    var boxElement = this.querySelector(".box");

    if(childrenElements != null)
      childrenElements.classList.remove("activeTree");

    if(boxElement != null)
      boxElement.classList.remove("check-box");
}).get();

  selectedCountryNames = [];
  updateGraph();
  updateSelectionsTree();
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

    newPlotData = {country: name, labels:labels, values: []};

    //get cases per day instead of total cases
    if(type != "line")
    {
      var previousValue = values[0];

      for (let i = 1; i < values.length; i++) {
        var value = values[i];
        newPlotData.values.push(value - previousValue);
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
  
    for(let i = 0; i < graphData.length; i++)
    {
      graphData[i].labels = graphData[i].labels.slice(futhrestLeftNonZero, graphData[i].labels.length);
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

  if(!isLineGraph)
  {
    //add moving average
    var averageInterval = 5;
    averageDatasets = [];

    for(let i = 0; i < graphData.length; i++)
    {
      var averageData = [];
      var total = 0;
      var interval = 0;
      var dates = [];

      for(var x = 0; x < datasets[i].data.length; x++)
      {
        total += datasets[i].data[x];
        interval++;

        if(x % averageInterval == 0 || x == datasets[i].data.length - 1)
        {
          var average = x == 0
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

function closestNames(name)
{
    var nameValues = [];
    var names = Object.keys(dataConfirmedOrdered);

    var sortedList = [];

    for (let i = 1; i < names.length; i++) {
        var distance = levenshteinDistance(names[i], name);
        nameValues.push([names[i], distance]);
    }

    nameValues.sort(function(a, b) {
        return a[1] - b[1];
    });

    nameValues.forEach(function(item){
      sortedList.push({text: item[0]})
    })

    return sortedList;   
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
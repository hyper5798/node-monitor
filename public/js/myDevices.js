console.log("Message admin device information");
var connected = false;
var host = window.location.hostname;
var port = window.location.port;
var opt2={
    //"order": [[ 2, "desc" ]],
    "iDisplayLength": 100,
    dom: 'Blrtip',
    buttons: [
        'copyHtml5',
        //'excelHtml5',
        'csvHtml5',
        //'pdfHtml5'
    ]
};
var table = $('#table1').dataTable(opt2);

var plot1,plot2,plot3,plot4,plot5,plot6;
var options1 ={
                title: "PH",
                axes:
                {
                    xaxis: {
                        numberTicks: 24,
                        renderer:$.jqplot.DateAxisRenderer,
                        tickOptions:{formatString:'%H:%M'}
                    },
                    yaxis: {
                        numberTicks: 10
                    }
                }
            };


if(location.protocol=="https:"){
  var wsUri="wss://"+host+":"+port+"/ws/devices";
} else {
  var wsUri="ws://"+host+":"+port+"/ws/devices";
}
console.log(wsUri);
var ws=null;

function wsConn() {
  ws = new WebSocket(wsUri);
  ws.onmessage = function(m) {
    //console.log('< from-node-red:',m.data);
    if (typeof(m.data) === "string" && m. data !== null){
      var msg =JSON.parse(m.data);
      console.log("from-node-red : id:"+msg.id);
      if(msg.id === 'init_table'){
          //Remove init button active
          //console.log("v : "+msg.v);

          //Reload table data
          //console.log("v type:"+typeof(msg.v));

          table.fnClearTable();
          var data = JSON.parse(msg.v);
          //console.log("addData type : "+ typeof(data)+" : "+data);
          if(data){
              table.fnAddData(data);
          }
          waitingDialog.hide();
          //Jason mark chart function
          //showChart(data);
      }
    }
  }
  ws.onopen = function() {
    var mac = document.getElementById("mac").value;
    var type = document.getElementById("type").value;
    var date = document.getElementById("date").value;
    var option= document.getElementById("option").value;
    var host = window.location.hostname;
    var port = window.location.port;
    var json = {mac:mac,type:type,date:date,option:option,host:host,port:port};
    //alert('date :'+ date);
    connected = true;
    var obj = {"id":"init","v":json};
    var getRequest = JSON.stringify(obj);
    console.log("getRequest type : "+ typeof(getRequest)+" : "+getRequest);
    console.log("ws.onopen : "+ getRequest);
    ws.send(getRequest);      // Request ui status from NR
    console.log(getRequest);

  }
  ws.onclose   = function()  {
    console.log('Node-RED connection closed: '+new Date().toUTCString());
    connected = false;
    ws = null;
  }
  ws.onerror  = function(){
    console.log("connection error");
  }
}
wsConn();           // connect to Node-RED server

function setButton(_id,_v){ // update slider
  myselect = $("#"+_id);
   myselect.val(_v);
   myselect.slider('refresh');
}

function toSecondTable(mac){
    //alert("mac : "+mac);
    //document.location.href="/device?mac="+mac;
}

function showDialog(){
    //waitingDialog.show('Custom message', {dialogSize: 'sm', progressType: 'warning'});
    waitingDialog.show();
    setTimeout(function () {
      waitingDialog.hide();
      }, 5000);
}

function back(){
    //alert('back');
    location.href=document.referrer;
}

function showChart(data){
    var tempList = [],doList=[];
    var condList = [],ntuList=[];
    var phList = [],volList=[];
    //alert('data.length : '+data.length);
    for(i=0;i<data.length;i++){
        //alert('i : '+i);
        if(i > (data.length-1) ){
            break;
        }else{

            phList.push([new Date(data[i][1]).getTime(),data[i][3] ]);
            doList.push([new Date(data[i][1]).getTime(),data[i][4] ]);
            condList.push([new Date(data[i][1]).getTime(),data[i][5] ]);
            tempList.push([new Date(data[i][1]).getTime(),data[i][6] ]);
            ntuList.push([new Date(data[i][1]).getTime(),data[i][7] ]);
            volList.push([new Date(data[i][1]).getTime(),data[i][8] ]);
        }

        /*if(i<2){
          alert('data[i] : '+JSON.stringify(data[i]) );
        alert('data[i][8] : '+data[i][3]);
        alert('data[i][8] : '+data[i][4]);
        alert('data[i][8] : '+data[i][5]);
        alert('data[i][8] : '+data[i][6]);
        alert('data[i][8] : '+data[i][7]);
        alert('data[i][8] : '+data[i][8]);
        }*/

    }


    tatalTime = Math.ceil((tempList[tempList.length-1][0]-tempList[0][0])/(1000*60*60))+1;
    //alert( tatalTime );
    if(tatalTime<12){
        x_number = tatalTime;
        formatStr = '%H:%M';
    }else if(tatalTime<26){
        x_number = tatalTime/2;
        formatStr = '%H:%M';
    }else if(tatalTime<24*7){
        x_number = Math.ceil(tatalTime/24);
        formatStr = '%m/%d';
    }else if(tatalTime<24*31){
        x_number = Math.ceil(tatalTime/(2*24));
        formatStr = '%m/%d';
    }else if(tatalTime<24*31*3){
        x_number = Math.ceil(tatalTime/(7*24));
        formatStr = '%m/%d';
    }


    if(plot1){
        plot1.destroy();
        plot2.destroy();
        plot3.destroy();
        plot4.destroy();
        plot5.destroy();
        plot6.destroy();

    }

    options1.axes.xaxis.numberTicks = x_number;
    options1.axes.xaxis.tickOptions.formatString = formatStr;
    //Jason add for chart to image on 2017.06.12
    options1.title = 'PH';
    plot1 = $.jqplot ('chartPH', [phList],options1);
    options1.title = 'DO';
    plot2 = $.jqplot ('chartDO', [doList],options1);
    options1.title = 'COND';
    plot3 = $.jqplot ('chartCOND', [condList],options1);
    options1.title = 'Temperature';
    plot4 = $.jqplot ('chartTmp', [tempList],options1);
    options1.title = 'NTU';
    plot5 = $.jqplot ('chartNTU', [ntuList],options1);
    options1.title = 'Voltage';
    plot6 = $.jqplot ('chartVol', [volList],options1);
    var imgPHData = $('#chartPH').jqplotToImageStr({});
    var imgPHElem = $('<img/>').attr('src',imgPHData);
    $('#imgChart1').append(imgPHElem);
    $("#chartPH").hide();
    var imgDOData = $('#chartDO').jqplotToImageStr({});
    var imgDOElem = $('<img/>').attr('src',imgDOData);
    $('#imgChart2').append(imgDOElem);
    $("#chartDO").hide();
    var imgCONDData = $('#chartCOND').jqplotToImageStr({});
    var imgCONDElem = $('<img/>').attr('src',imgCONDData);
    $('#imgChart3').append(imgCONDElem);
    $("#chartCOND").hide();
    var imgTmpData = $('#chartTmp').jqplotToImageStr({});
    var imgTmpElem = $('<img/>').attr('src',imgTmpData);
    $('#imgChart4').append(imgTmpElem);
    $("#chartTmp").hide();
    var imgNTUData = $('#chartNTU').jqplotToImageStr({});
    var imgNTUElem = $('<img/>').attr('src',imgNTUData);
    $('#imgChart5').append(imgNTUElem);
    $("#chartNTU").hide();
    var imgVolData = $('#chartVol').jqplotToImageStr({});
    var imgVolElem = $('<img/>').attr('src',imgVolData);
    $('#imgChart6').append(imgVolElem);
    $("#chartVol").hide();
}

function changeChartDisplay(){
  var obj = document.getElementById("chartBtn");
  alert(obj.value);
  if(obj.value === 'Show Chart'){
    obj.value = 'Hide Chart';
   $("#chartBlock").hide();
  }else{
    obj.value = 'Show Chart';
    $("#chartBlock").show();
  }
}

$(document).ready(function(){
    showDialog();


  $('#chartBlock').tabs({
    onSelect:function(title){
        if(title==='DO'){
              alert(title);
             $('#my_tabs').tabs('load', 0);
        }
      },
      onLoad:function(panel){
        alert(panel.panel('options').title+' is loaded')
      }
    })

});
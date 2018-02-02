(function() {
    var myConnector = tableau.makeConnector();

    function proxyrequest() {
      tableau.connectionName = "Five9CallLog";
      var credentials = document.getElementsByName("username")[0].value+":"+document.getElementsByName("password")[0].value;
      var formdata = {"cred" : credentials};
      tableau.connectionData = JSON.stringify(formdata);
      tableau.submit();
    }; //end of proxyrequest

      myConnector.getSchema = function (schemaCallback) {
        var cols = [
          { id : "CallId", alias : "CallId", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "Timestamp", alias : "Timestamp", columnRole: "dimension", dataType : tableau.dataTypeEnum.datetime },
          { id : "Campaign", alias : "Campaign", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "CallType", alias : "CallType", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "AgentEmail", alias : "AgentEmail", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "AgentName", alias : "AgentName", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "Disposition", alias : "Disposition", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "ANI", alias : "ANI", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "CustomerName", alias : "CustomerName", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "DNIS", alias : "DNIS", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "CallTime", alias : "CallTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "BillTime", alias : "BillTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "Cost", alias : "Cost", columnRole: "measure", dataType : tableau.dataTypeEnum.float },
          { id : "IVRTime", alias : "IVRTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "QueueWaitTime", alias : "QueueWaitTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "RingTime", alias : "RingTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "TalkTime", alias : "TalkTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "HoldTime", alias : "HoldTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "ParkTime", alias : "ParkTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "AfterCallWorkTime", alias : "AfterCallWorkTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "Transfers", alias : "Transfers", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "Conferences", alias : "Conferences", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "Holds", alias : "Holds", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "Abandoned", alias : "Abandoned", columnRole: "dimension", dataType : tableau.dataTypeEnum.int }
        ];

        var tableInfo = {
          id : "runReportCallLog",
          alias : "Five9CallLog",
          columns : cols
        };

        schemaCallback([tableInfo]);
      }; //end of getschema

      myConnector.getData = function (table, doneCallback) {
        var formdata = JSON.parse(tableau.connectionData);

        function timeParser(timeField) {
          if (typeof timeField != "undefined" & timeField != null) {
            return parseInt(timeField.split(':')[0]*60*60)+parseInt(timeField.split(':')[1]*60)+parseInt(timeField.split(':')[2]);
          } else {
            return null;
          }
        };

        function getMonthFromString(mon){
           var d = Date.parse(mon + "1, 2012");
           if(!isNaN(d)){
              return new Date(d).getMonth() + 1;
           }
           return -1;
         };

        $.ajax({type: "POST",
                url: "../../response",
                data: formdata,
                dataType: "json",
                success: function(resp) {
                  tableData = [];
                  // Iterate over the JSON object
                  for (var i = 0, len = resp.length; i < len; i++) {
                            if (typeof resp[i][1] != "undefined" & resp[i][1] != null) {
                              var y = resp[i][1].split(' ');
                              var ts = getMonthFromString(y[2])+'/'+y[1]+'/'+y[3]+' '+y[4];
                            } else {
                              var ts = null;
                            };
                            tableData.push({
                                "CallId" : resp[i][0],
                                "Timestamp" : ts,
                                "Campaign" : resp[i][2],
                                "CallType" : resp[i][3],
                                "AgentEmail" : resp[i][4],
                                "AgentName" : resp[i][5],
                                "Disposition" : resp[i][6],
                                "ANI" : resp[i][7],
                                "CustomerName" : resp[i][8],
                                "DNIS" : resp[i][9],
                                "CallTime" : timeParser(resp[i][10]),
                                "BillTime" : timeParser(resp[i][11]),
                                "Cost" : resp[i][12],
                                "IVRTime" : timeParser(resp[i][13]),
                                "QueueWaitTime" : timeParser(resp[i][14]),
                                "RingTime" : timeParser(resp[i][15]),
                                "TalkTime" : timeParser(resp[i][16]),
                                "HoldTime" : timeParser(resp[i][17]),
                                "ParkTime" : timeParser(resp[i][18]),
                                "AfterCallWorkTime" : timeParser(resp[i][19]),
                                "Transfers" : resp[i][20],
                                "Conferences" : resp[i][21],
                                "Holds" : resp[i][22],
                                "Abandoned" : resp[i][23]
                          });

                      }

                    table.appendRows(tableData);
                    doneCallback();
                }
        });

        }; //end of getdata

    tableau.registerConnector(myConnector);

    $(document).ready(function() {
      $("#submitButton").click(function () {
        proxyrequest();
      });
    });

  })();

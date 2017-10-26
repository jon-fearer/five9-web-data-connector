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
          { id : "Timestamp", alias : "Timestamp", columnRole: "dimension", dataType : tableau.dataTypeEnum.datetime },
          { id : "Abandoned", alias : "Abandoned", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "CustomerName", alias : "CustomerName", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "ANI", alias : "ANI", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "CallId", alias : "CallId", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "CallType", alias : "CallType", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "Campaign", alias : "Campaign", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "Disposition", alias : "Disposition", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "DNIS", alias : "DNIS", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "AfterCallWorkTime", alias : "AfterCallWorkTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "HandleTime", alias : "HandleTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "QueueWaitTime", alias : "QueueWaitTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "BillTime", alias : "BillTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "HoldTime", alias : "HoldTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "ParkTime", alias : "ParkTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "TimeToAbandon", alias : "TimeToAbandon", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "CallTime", alias : "CallTime", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "Cost", alias : "Cost", columnRole: "measure", dataType : tableau.dataTypeEnum.float },
          { id : "AgentEmail", alias : "AgentEmail", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "AgentGroup", alias : "AgentGroup", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "Practice", alias : "Practice", columnRole : "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "ContactType", alias : "ContactType", columnRole : "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "PracticeAdvocate", alias : "PracticeAdvocate", columnRole : "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "PracticeId", alias : "PracticeId", columnRole : "dimension", dataType : tableau.dataTypeEnum.int }
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
          if (typeof timeField != "undefined") {
            return parseInt(timeField.split(':')[0]*60*60)+parseInt(timeField.split(':')[1]*60)+parseInt(timeField.split(':')[2]);
          } else {
            return null;
          }
        };

        $.ajax({type: "POST",
                url: "../../response",
                data: formdata,
                dataType: "json",
                success: function(resp) {
                  var feat = resp.return.records;
                  tableData = [];

                  // Iterate over the JSON object
                  for (var i = 0, len = feat.length; i < len; i++) {
                            tableData.push({
                                "Timestamp" : feat[i].values.data[0].$.replace('/','-').replace('/','-')+' '+feat[i].values.data[1].$+'.000',
                                "Abandoned": feat[i].values.data[2].$,
                                "CustomerName": feat[i].values.data[3].$,
                                "ANI": feat[i].values.data[4].$,
                                "CallId": feat[i].values.data[5].$,
                                "CallType": feat[i].values.data[6].$,
                                "Campaign": feat[i].values.data[7].$,
                                "Disposition" : feat[i].values.data[8].$,
                                "DNIS": feat[i].values.data[9].$,
                                "AfterCallWorkTime": timeParser(feat[i].values.data[10].$),
                                "HandleTime": timeParser(feat[i].values.data[11].$),
                                "QueueWaitTime": timeParser(feat[i].values.data[12].$),
                                "BillTime": timeParser(feat[i].values.data[13].$),
                                "HoldTime": timeParser(feat[i].values.data[14].$),
                                "ParkTime": timeParser(feat[i].values.data[15].$),
                                "TimeToAbandon": timeParser(feat[i].values.data[16].$),
                                "CallTime": timeParser(feat[i].values.data[17].$),
                                "Cost": feat[i].values.data[18].$,
                                "AgentEmail": feat[i].values.data[19].$,
                                "AgentGroup": feat[i].values.data[20].$,
                                "Practice": feat[i].values.data[21].$,
                                "ContactType": feat[i].values.data[22].$,
                                "PracticeAdvocate": feat[i].values.data[23].$,
                                "PracticeId": feat[i].values.data[24].$
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

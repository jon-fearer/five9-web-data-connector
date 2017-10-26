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
          { id : "Date", alias : "Date", columnRole: "dimension", dataType : tableau.dataTypeEnum.date },
          { id : "Time", alias : "Time", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "Abandoned", alias : "Abandoned", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "CustomerName", alias : "CustomerName", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "ANI", alias : "ANI", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "CallId", alias : "CallId", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "CallType", alias : "CallType", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "Campaign", alias : "Campaign", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "Disposition", alias : "Disposition", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "DNIS", alias : "DNIS", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "AfterCallWorkTime", alias : "AfterCallWorkTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "HandleTime", alias : "HandleTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "QueueWaitTime", alias : "QueueWaitTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "BillTime", alias : "BillTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "HoldTime", alias : "HoldTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "ParkTime", alias : "ParkTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "TimeToAbandon", alias : "TimeToAbandon", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "CallTime", alias : "CallTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
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
                                "Date": feat[i].values.data[0].$,
                                "Time": feat[i].values.data[1].$,
                                "Abandoned": feat[i].values.data[2].$,
                                "CustomerName": feat[i].values.data[3].$,
                                "ANI": feat[i].values.data[4].$,
                                "CallId": feat[i].values.data[5].$,
                                "CallType": feat[i].values.data[6].$,
                                "Campaign": feat[i].values.data[7].$,
                                "Disposition" : feat[i].values.data[8].$,
                                "DNIS": feat[i].values.data[9].$,
                                "AfterCallWorkTime": feat[i].values.data[10].$,
                                "HandleTime": feat[i].values.data[11].$,
                                "QueueWaitTime": feat[i].values.data[12].$,
                                "BillTime": feat[i].values.data[13].$,
                                "HoldTime": feat[i].values.data[14].$,
                                "ParkTime": feat[i].values.data[15].$,
                                "TimeToAbandon": feat[i].values.data[16].$,
                                "CallTime": feat[i].values.data[17].$,
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

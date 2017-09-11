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
          { id : "Timestamp", alias : "Timestamp", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "Campaign", alias : "Campaign", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "CallType", alias : "CallType", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "Agent", alias : "Agent", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "AgentName", alias : "AgentName", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "Disposition", alias : "Disposition", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "ANI", alias : "ANI", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "CustomerName", alias : "CustomerName", columnRole: "dimension", dataType : tableau.dataTypeEnum.string },
          { id : "DNIS", alias : "DNIS", columnRole: "dimension", dataType : tableau.dataTypeEnum.int },
          { id : "CallTime", alias : "CallTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "BillTime", alias : "BillTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "Cost", alias : "Cost", columnRole: "measure", dataType : tableau.dataTypeEnum.float },
          { id : "IVRTime", alias : "IVRTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "QueueWaitTime", alias : "QueueWaitTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "RingTime", alias : "RingTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "TalkTime", alias : "TalkTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "HoldTime", alias : "HoldTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "ParkTime", alias : "ParkTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "AfterCallWorkTime", alias : "AfterCallWorkTime", columnRole: "measure", dataType : tableau.dataTypeEnum.datetime },
          { id : "Transfers", alias : "Transfers", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "Conferences", alias : "Transfers", columnRole: "measure", dataType : tableau.dataTypeEnum.int },
          { id : "Holds", alias : "Transfers", columnRole: "measure", dataType : tableau.dataTypeEnum.int }
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
                  var feat = resp.Envelope.Body.getReportResultResponse.return.records;
                  tableData = [];

                  // Iterate over the JSON object
                  for (var i = 0, len = feat.length; i < len; i++) {
                            tableData.push({
                                "CallId": feat[i].values.data[0].$,
                                "Timestamp": feat[i].values.data[1].$,
                                "Campaign": feat[i].values.data[2].$,
                                "CallType": feat[i].values.data[3].$,
                                "Agent": feat[i].values.data[4].$,
                                "AgentName": feat[i].values.data[5].$,
                                "Disposition": feat[i].values.data[6].$,
                                "ANI": feat[i].values.data[7].$,
                                "CustomerName": feat[i].values.data[8].$,
                                "DNIS": feat[i].values.data[9].$,
                                "CallTime": feat[i].values.data[10].$,
                                "BillTime": feat[i].values.data[11].$,
                                "Cost": feat[i].values.data[12].$,
                                "IVRTime": feat[i].values.data[13].$,
                                "QueueWaitTime": feat[i].values.data[14].$,
                                "RingTime": feat[i].values.data[15].$,
                                "TalkTime": feat[i].values.data[16].$,
                                "HoldTime": feat[i].values.data[17].$,
                                "ParkTime": feat[i].values.data[18].$,
                                "AfterCallWorkTime": feat[i].values.data[19].$,
                                "Transfers": feat[i].values.data[20].$,
                                "Conferences": feat[i].values.data[21].$,
                                "Holds": feat[i].values.data[22].$
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

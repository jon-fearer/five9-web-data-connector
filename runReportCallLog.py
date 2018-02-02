from flask import Flask, jsonify, render_template, request
from suds.client import Client
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from base64 import b64encode
app = Flask(__name__)

@app.route('/')
def index():
    return app.send_static_file('runReportCallLog.html')

@app.route('/response', methods=['POST'])
def getData():
    r = request.form["cred"]
    user, pass1 = r.split(':', 1)
    auth = b'Basic '+b64encode(str.encode(r))
    url = 'https://api.five9.com/wsadmin/AdminWebService?wsdl&user='+user
    headers = {'Content-Type' : 'text/xml;charset=UTF-8', 'Authorization': auth}
    x = Client(url, headers=headers, retxml=True)

    campaignXML = x.service.getCampaigns()
    campaignSoup = BeautifulSoup(campaignXML,'html.parser')
    campaigns = []
    for n in campaignSoup.findAll('name'): campaigns.append(n.contents[0])

    customCriteria = x.factory.create('customReportCriteria')
    folderName = 'Call Log Reports'
    reportName = 'Call Log'
    reportObjectList = x.factory.create('reportObjectList')
    reportObjectList.objectType.value = 'Campaign'
    reportObjectList.objectNames = campaigns
    customCriteria.reportObjects = [reportObjectList]

    missingTimestamp = True
    while(missingTimestamp):
        enddate = datetime.now().isoformat()[:-3]+'-07:00'
        startdate = (datetime.now() + timedelta(days=-1)).isoformat()[:-3]+'-07:00'
        customCriteria.time = {'end' : enddate, 'start' : startdate}
        
        runReportResponse = x.service.runReport(folderName,reportName,customCriteria)
        soup = BeautifulSoup(runReportResponse,'html.parser')
        reportID = soup.find('return').string

        response = 'true'
        while (response == 'true'):
            isReportRunningResponse = x.service.isReportRunning(reportID,'10')
            soup = BeautifulSoup(isReportRunningResponse,'html.parser')
            response = soup.find('return').string

        getReportResultResponseXML = x.service.getReportResult(reportID)
        if '</header><records><values><data xmlns' in str(getReportResultResponseXML)[:1780]:
            missingTimestamp = True
        else:
            missingTimestamp = False
            soup = BeautifulSoup(getReportResultResponseXML,'html.parser')
            data = []
            rundate = datetime.now()
            for record in soup.findAll('records'):
                for col,value in enumerate(record.findAll('data')):
                    if col == 0:
                        callid = value.string
                    elif col == 1:
                        ts = value.string
                    elif col == 2:
                        campaign = value.string
                    elif col == 3:
                        calltype = value.string
                    elif col == 4:
                        agent = value.string
                    elif col == 5:
                        agentname = value.string
                    elif col == 6:
                        dispo = value.string
                    elif col == 7:
                        ani = value.string
                    elif col == 8:
                        customer = value.string
                    elif col == 9:
                        dnis = value.string
                    elif col == 10:
                        calltime = value.string
                    elif col == 11:
                        billtime = value.string
                    elif col == 12:
                        cost = value.string
                    elif col == 13:
                        ivrtime = value.string
                    elif col == 14:
                        qwt = value.string
                    elif col == 15:
                        rt = value.string
                    elif col == 16:
                        tt = value.string
                    elif col == 17:
                        ht = value.string
                    elif col == 18:
                        parktime = value.string
                    elif col == 19:
                        acwt = value.string
                    elif col == 20:
                        transfers = value.string
                    elif col == 21:
                        conf = value.string
                    elif col == 22:
                        holds = value.string
                    elif col == 23:
                        abandoned = value.string
                data.append([callid,ts,campaign,calltype,agent,agentname,dispo,ani,customer,\
                                          dnis,calltime,billtime,cost,ivrtime,qwt,rt,tt,ht,parktime,acwt,\
                                          transfers,conf,holds,abandoned])
    return jsonify(data)
    
if __name__ == '__main__':
    app.run()

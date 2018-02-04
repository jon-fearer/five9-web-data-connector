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
    r = request.form['cred']
    user, pass1 = r.split(':', 1)
    auth = b'Basic '+b64encode(str.encode(r))
    url = 'https://api.five9.com/wsadmin/AdminWebService?wsdl&user='+user
    headers = {'Content-Type' : 'text/xml;charset=UTF-8', 'Authorization': auth}
    x = Client(url, headers=headers, retxml=True)

    campaignXML = x.service.getCampaigns()
    campaignSoup = BeautifulSoup(campaignXML,'html.parser')
    campaigns = []
    for n in campaignSoup.findAll('name'):
        campaigns.append(n.contents[0])

    customCriteria = x.factory.create('customReportCriteria')
    folderName = 'Call Log Reports'
    reportName = 'Call Log'
    reportObjectList = x.factory.create('reportObjectList')
    reportObjectList.objectType.value = 'Campaign'
    reportObjectList.objectNames = campaigns
    customCriteria.reportObjects = [reportObjectList]

    enddate = request.form['endDate']+'.000-07:00'
    startdate = request.form['startDate']+'.000-07:00'
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
    soup = BeautifulSoup(getReportResultResponseXML,'html.parser')
    data = []
    rundate = datetime.now()
    for record in soup.findAll('records'):
        item = record.findAll('data')
        data.append([value.string for value in item])
    return jsonify(data)
    
if __name__ == '__main__':
    app.run()

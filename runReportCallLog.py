from flask import Flask, jsonify, render_template, request
from suds.client import Client
from json import dumps
from xmljson import badgerfish as bf
from xml.etree.ElementTree import fromstring
from BeautifulSoup import BeautifulSoup
from datetime import datetime, timedelta
app = Flask(__name__)

@app.route('/')
def index():
    return app.send_static_file('runReportCallLog.html')

@app.route('/response', methods=['POST'])
def getData():
    r = dumps(request.form["cred"]).rstrip('"').lstrip('"')
    user, pass1 = r.split(':', 1)
    auth = 'Basic '+r.encode('base64').rstrip('\n')
    url = 'https://api.five9.com/wsadmin/AdminWebService?wsdl&user='+user
    headers = {'Content-Type' : 'text/xml;charset=UTF-8', 'Authorization': auth}
    x = Client(url, headers=headers, retxml=True)

    campaignXML = x.service.getCampaigns()
    campaignSoup = BeautifulSoup(campaignXML)
    campaigns = []
    for n in campaignSoup.findAll('name'): campaigns.append(n.contents[0])

    customCriteria = x.factory.create('customReportCriteria')
    folderName = 'Call Log Reporting'
    reportName = 'Call Log All - Jon'
    reportObjectList = x.factory.create('reportObjectList')
    reportObjectList.objectType.value = 'Campaign'
    reportObjectList.objectNames = campaigns
    customCriteria.reportObjects = [reportObjectList]

    missingTimestamp = True
    while(missingTimestamp):
        enddate = datetime.now().isoformat()[:-3]+'-07:00'
        startdate = (datetime.now() + timedelta(days=-70)).isoformat()[:-3]+'-07:00'
        customCriteria.time = {'end' : enddate, 'start' : startdate}
        
        runReportResponse = x.service.runReport(folderName,reportName,customCriteria)
        soup = BeautifulSoup(runReportResponse)
        reportID = soup.find('return').string

        response = 'true'
        while (response == 'true'):
            isReportRunningResponse = x.service.isReportRunning(reportID,'10')
            soup = BeautifulSoup(isReportRunningResponse)
            response = soup.find('return').string

        getReportResultResponseXML = x.service.getReportResult(reportID)
        content, end = getReportResultResponseXML.split('<return>')[1].split('</return>')
        content = '<return>'+content+'</return>'
        if '</header><records><values><data xmlns' in content[:1780]:
            missingTimestamp = True
        else:
            missingTimestamp = False
            outputjson = dumps(bf.data(fromstring(content)))
    return outputjson
    
if __name__ == '__main__':
    app.run()

from flask import Flask, jsonify, render_template, request
from suds.client import Client
from json import dumps, loads
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

    output = x.service.getCampaigns()
    outputclean = output.replace('env:','').replace('soap:',''). \
                  replace(' xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"',''). \
                  replace(' xmlns:env=\'http://schemas.xmlsoap.org/soap/envelope/\'',''). \
                  replace('ns2:',''). \
                  replace(' xmlns:ns2="http://service.admin.ws.five9.com/"','')
    outputjson = dumps(bf.data(fromstring(outputclean)), indent=4, separators=(',', ': '))
    camps = loads(outputjson)
    campaigns = []
    camplen = len(camps['Envelope']['Body']['getCampaignsResponse']['return'])
    for i in range(0,camplen):
        campaigns.append(camps['Envelope']['Body']['getCampaignsResponse']['return'][i]['name']['$'])

    enddate = datetime.today() + timedelta(days=1)
    if (enddate.month >= 10):
        if (enddate.day >= 10):
            end = str(enddate.year)+'-'+str(enddate.month)+'-'+str(enddate.day)+'T12:00:00.000-07:00'
        else:
            end = str(enddate.year)+'-'+str(enddate.month)+'-0'+str(enddate.day)+'T12:00:00.000-07:00'
    else:
        if (enddate.day >= 10):
            end = str(enddate.year)+'-0'+str(enddate.month)+'-'+str(enddate.day)+'T12:00:00.000-07:00'
        else:
            end = str(enddate.year)+'-0'+str(enddate.month)+'-0'+str(enddate.day)+'T12:00:00.000-07:00'

    startdate = datetime.today() + timedelta(days=-35)
    if (startdate.month >= 10):
        if (startdate.day >= 10):
            start = str(startdate.year)+'-'+str(startdate.month)+'-'+str(startdate.day)+'T12:00:00.000-07:00'
        else:
            start = str(startdate.year)+'-'+str(startdate.month)+'-0'+str(startdate.day)+'T12:00:00.000-07:00'
    else:
        if (startdate.day >= 10):
            start = str(startdate.year)+'-0'+str(startdate.month)+'-'+str(startdate.day)+'T12:00:00.000-07:00'
        else:
            start = str(startdate.year)+'-0'+str(startdate.month)+'-0'+str(startdate.day)+'T12:00:00.000-07:00'

    customCriteria = x.factory.create('customReportCriteria')
    customCriteria.time = {'end' : end, 'start' : start}
    folderName = 'Daily Reports'
    reportName = 'Call Log'
    reportObjectList = x.factory.create('reportObjectList')
    reportObjectList.objectType.value = 'Campaign'
    reportObjectList.objectNames = campaigns
    customCriteria.reportObjects = [reportObjectList]

    runReportResponse = x.service.runReport(folderName,reportName,customCriteria)
    soup = BeautifulSoup(runReportResponse)
    reportID = soup.find('return').string

    response = 'true'
    while (response == 'true'):
        isReportRunningResponse = x.service.isReportRunning(reportID,'10')
        soup = BeautifulSoup(isReportRunningResponse)
        response = soup.find('return').string

    getReportResultResponse = x.service.getReportResult(reportID)
    output = getReportResultResponse.replace('env:Envelope xmlns:env=\'http://schemas.xmlsoap.org/soap/envelope/\'','Envelope') \
             .replace('env:','').replace('ns2:getReportResultResponse xmlns:ns2="http://service.admin.ws.five9.com/"','getReportResultResponse') \
             .replace(' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"','').replace('ns2:','') \
             .replace('soap:','').replace(' xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"','')
    outputjson = dumps(bf.data(fromstring(output)))
    return outputjson

if __name__ == '__main__':
    app.run()

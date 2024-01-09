import ApiService from '../../ApiService';
import DateTime from "../../helpers/DateTime";

const apiService = new ApiService();
const dateTime = new DateTime();

export enum ReportStatus {
    Waiting = 1,
    Processing = 2,
    Generated = 3,
}

const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
};

export const fetchDetailedReport = async () => {
    try {
        const from = '2010-01-01';
        const to = dateTime.formatToYmd(dateTime.getNow());
        console.log('[fetchDetailedReport] Start...', {from, to});
        const responseInit = await apiService.initDetailedReport(from, to);

        if (!responseInit || !responseInit.id) {
            throw new Error('Error initializing report. No id in response.');
        }

        const reportId = responseInit.id;
        console.log('[fetchDetailedReport] Report ID: ' + reportId);

        let reportStatus = null;
        do {
            console.log('[fetchDetailedReport] Fetch report status...');
            const responseStatus = await apiService.getReportStatus(reportId);

            if (!responseStatus || !responseStatus.id) {
                throw new Error('Error initializing report. No id in status response.');
            }
            reportStatus = responseStatus.id;
            console.log('[fetchDetailedReport] Report status: ' + reportStatus);
            await delay(1000);
        } while (reportStatus !== ReportStatus.Generated);

        console.log('[fetchDetailedReport] Done');
        const responseResult = await apiService.getReportResult(reportId);

        console.log('[fetchDetailedReport] Report result:', {responseResult});
        return responseResult;
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};
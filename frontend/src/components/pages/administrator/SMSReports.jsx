import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import TopMessage from 'components/common/layout/TopMessage';
import BackEndPage from 'components/common/layout/BackEndPage';
import NoContent from 'components/common/utils/NoContent';
import { getDateTime } from 'utils/date-helpers';
import LoadItems from 'components/common/utils/LoadItems';
import { callKudiSMS , buildBackendSMSUrl } from 'utils/sms';
import { getNairaSymbol } from 'utils/helpers';

const Reports = () => {
  const [reports, setReports] = React.useState([]);
  const [balance, setBalance] = React.useState(null);

 React.useEffect(() => {
  axios
    .get('api/v1/dlr/kudisms')
    .then(function (response) {
      const { data } = response;
      console.log(data);
     setReports(Array.isArray(data) ? data : []);

    })
    .catch(function (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    });
}, []);


 React.useEffect(() => {
   axios
    .get('api/v1/getKudi/balance')
    .then(function (response) {
      const { data } = response;
      console.log(data);
    
      setBalance(data.smsBalance);

    })
    .catch(function (error) {
      console.error('Error fetching reports:', error);
      setBalance(0)
    });
   }, []);

  return (
    <BackEndPage title="SMS Reports">
      <div className="main-app">
        <TopMessage />

        <section className="app-content">
          <h3 className="main-app__title">
            SMS Balance: {getNairaSymbol()} {balance}
          </h3>
          <LoadItems
            items={reports}
            loadingText="Loading your SMS Reports"
            noContent={<NoContent isButton text="No SMS Reports found" />}
          >
            <ReportsRowList reports={reports || []} />
          </LoadItems>
        </section>
      </div>
    </BackEndPage>
  );
};

const ReportsRowList = ({ reports }) => (
  <div className="table-responsive">
    <table className="table table-dark table__no-border table__with-bg">
      <tbody>
        {reports.map((report, index) => (
          <ReportsRow key={index} report={report} />
        ))}
      </tbody>
    </table>
    <br />
    <br />
  </div>
);

ReportsRowList.propTypes = {
  reports: PropTypes.array.isRequired,
};

const ReportsRow = ({ report }) => (
  <tr>
    <td className="table__number" width="5%">
      <span
        className={`circle ${report.status === 'DELIVERED' ? 'green' : 'gray'}`}
      ></span>
    </td>
    <td width="15%">
      <span className="text-white">{report.status}</span>
    </td>
    <td width="50%">
      <span className="text-muted-light-2 small--2">{report.message}</span>
    </td>

    <td width="15%">
      <span className="text-white">{report.mobile}</span>
    </td>
    <td className="text-right" width="15%">
      <span>
        <i className="icon icon-clock" /> {getDateTime(report.date)}
      </span>
    </td>
  </tr>
);

ReportsRow.propTypes = {
  report: PropTypes.object.isRequired,
};

export default Reports;

import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import TopMessage from "components/common/layout/TopMessage";
import BackEndPage from "components/common/layout/BackEndPage";
import DashboardOverviewCard from "components/common/utils/DashboardOverviewCard";
import { getTokenFromStore } from "utils/localStorage";
import { UserContext } from "context/UserContext";
import LoadingScreen from "components/common/layout/LoadingScreen";
import Events from "components/pages/entertainer/UpcomingEvents";
import {
  getItems,
  getNairaSymbol,
  moneyFormatInNaira,
  priceCalculatorHelper,
} from "utils/helpers";
import NoContent from "components/common/utils/NoContent";
import LoadItems from "components/common/utils/LoadItems";
import Humanize from "humanize-plus";
import { Link } from "@reach/router";
import { callKudiSMS,buildBackendSMSUrl } from "utils/sms";

const Dashboard = () => {
  const { userState } = React.useContext(UserContext);
  const [loading, setLoading] = React.useState(true);
  const [balance, setBalance] = React.useState(null);
  const [results, setResults] = React.useState({
    auctions: null,
    bids: null,
    requests: null,
    upcomingEvents: null,
    eventsOverview: null,
    userOverview: null,
    unresolvedEvents: 0,
  });
  React.useEffect(() => {
    axios
      .get(`/api/v1/applications/dashboard/admin`, {
        headers: {
          "x-access-token": getTokenFromStore(),
        },
      })
      .then(function (response) {
        const { status, data } = response;
        // handle success
        if (status === 200) {
          setResults(data.results);
          console.log("results", data.results);
          setLoading(false);
        }
      })
      .catch(function (error) {
        setResults([]);
        setLoading(false);
      });
  }, []);

  
  React.useEffect(() => {
    axios
    .get('/api/v1/getKudi/balance')
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
    <BackEndPage title="Dashboard">
      <div className="main-app">
        <TopMessage message={`Welcome back ${userState.firstName},`} />
        {loading ? (
          <LoadingScreen text="Refreshing your Dashboard" />
        ) : (
          <Dashboard.Items {...results} balance={balance} />
        )}
      </div>
    </BackEndPage>
  );
};

Dashboard.Items = ({
  balance,
  eventsOverview,
  paymentsOverview,
  pendingPayments,
  upcomingEvents,
  usersOverview,
  unresolvedEvents,
}) => {
  return (
    <>
      <section className="app-content">
        {unresolvedEvents > 0 && (
          <section className="row">
            <div className="col-sm-12">
              <div className="card card-custom text-red py-2 px-4">
                <h6 className="text-red font-weight-normal mt-3">
                  You have {unresolvedEvents} unresolved cases.{" "}
                  <Link
                    className="btn btn-transparent btn-danger float-right"
                    to="/admin/unresolved-events"
                  >
                    Resolve Now
                  </Link>
                </h6>
              </div>
            </div>
          </section>
        )}
        <div className="row">
          <DashboardOverviewCard
            color="yellow"
            textLink="View Registered Users"
            title="All Users"
            to="/admin/registered-users"
          >
            <DashboardOverviewCard.List
              color="yellow"
              icon="user-circle"
              number={usersOverview && (usersOverview[1] || "0")}
              title="Users"
            />
            <DashboardOverviewCard.List
              color="yellow"
              icon="entertainers"
              number={usersOverview && (usersOverview[2] || "0")}
              title="Entertainers"
            />
            <DashboardOverviewCard.List
              color="yellow"
              icon="band-members"
              number={usersOverview && (usersOverview[3] || "0")}
              title="Band Members"
            />
          </DashboardOverviewCard>
          <DashboardOverviewCard
            color="green"
            textLink="View All Events"
            title="Event Entertainers"
            to="/admin/upcoming-events"
          >
            <DashboardOverviewCard.List
              color="green"
              icon="auction"
              number={eventsOverview && (eventsOverview["Auction"] || "0")}
              title="Auctions"
            />
            <DashboardOverviewCard.List
              color="green"
              icon="hire-entertainers"
              number={
                eventsOverview && (eventsOverview["Recommendation"] || "0")
              }
              title="Recommendation"
            />
            <DashboardOverviewCard.List
              color="green"
              icon="vcard"
              number={eventsOverview && (eventsOverview["Search"] || "0")}
              title="Search"
            />
          </DashboardOverviewCard>
          <DashboardOverviewCard
            color="blue"
            textLink="View User Payments"
            title="Payments"
            to="/admin/users-payment"
          >
            <DashboardOverviewCard.List
              color="blue"
              icon="money"
              number={
                paymentsOverview && (paymentsOverview["userPayments"] || "0")
              }
              title="User Payments"
            />
            <DashboardOverviewCard.List
              color="blue"
              icon="credit-card"
              number={
                paymentsOverview &&
                (paymentsOverview["paidEntertainers"] || "0")
              }
              title="Paid Entertainers"
            />
            <DashboardOverviewCard.List
              color="blue"
              icon="help"
              number={
                paymentsOverview && (paymentsOverview["pendingPayments"] || "0")
              }
              title="Pending Payments"
              to="/admin/events"
            />
          </DashboardOverviewCard>
        </div>

        <div className="row">
          <div className="col-sm-8">
            <Dashboard.UpcomingEvents
              events={
                upcomingEvents && upcomingEvents.length > 0
                  ? getItems(upcomingEvents, 2)
                  : []
              }
            />
          </div>
          <div className="col-sm-4">
            <Dashboard.SmsBalance balance={balance} />
            <Dashboard.PendingPayments pendingPayments={pendingPayments} />
          </div>
        </div>
      </section>
    </>
  );
};

Dashboard.Items.propTypes = {
  balance: PropTypes.any,
  eventsOverview: PropTypes.object.isRequired,
  paymentsOverview: PropTypes.object.isRequired,
  pendingPayments: PropTypes.array.isRequired,
  unresolvedEvents: PropTypes.number.isRequired,
  upcomingEvents: PropTypes.array.isRequired,
  usersOverview: PropTypes.object.isRequired,
};

Dashboard.Items.defaultProps = {
  balance: null,
};

Dashboard.UpcomingEvents = ({ events }) => (
  <div className="card card-custom">
    <div className="card-body">
      <h5 className="font-weight-normal text-blue">Upcoming Events</h5>
      <div className="table-responsive">
        <table className="table table-dark table__no-border table__with-bg">
          <tbody>
            {events.length > 0 ? (
              <Events.CardList events={events} />
            ) : (
              <tr className="transparent">
                <td>
                  <NoContent text="No upcoming events" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

Dashboard.UpcomingEvents.propTypes = {
  events: PropTypes.array.isRequired,
};

Dashboard.PendingPayments = ({ pendingPayments }) => (
  <div className="card card-custom">
    <div className="card-body">
      <h5 className="font-weight-normal text-green">Pending Payments</h5>
      <small className="text-muted d-block mb-3">
        {pendingPayments && pendingPayments.length > 0 && (
          <>
            You have{" "}
            <Link to="/admin/pending-payments">
              {pendingPayments.length} pending{" "}
              {Humanize.pluralize(pendingPayments.length, "payment")}
            </Link>
          </>
        )}
      </small>

      <div className="table-responsive">
        <LoadItems
          items={pendingPayments}
          noContent={<NoContent text="No pending payments" />}
        >
          <table className="table table-dark table-border--x">
            <tbody>
              {pendingPayments &&
                pendingPayments.length > 0 &&
                pendingPayments.map((payment, index) => {
                  const price = payment.applications[0].proposedPrice
                    ? payment.applications[0].proposedPrice
                    : payment.applications[0].askingPrice;
                  const calculatedPrice = priceCalculatorHelper(
                    price,
                    payment.applications[0].commission,
                    payment.hireType
                  );
                  return (
                    <Dashboard.PendingPaymentRow
                      event={payment.event.eventType}
                      id={payment.applications[0].id}
                      key={index}
                      payment={
                        payment.applications[0].takeHome ||
                        calculatedPrice.entertainerFee
                      }
                    />
                  );
                })}
            </tbody>
          </table>
        </LoadItems>
      </div>
    </div>
  </div>
);

Dashboard.PendingPayments.propTypes = {
  pendingPayments: PropTypes.array,
};

Dashboard.PendingPayments.defaultProps = {
  pendingPayments: [],
};

Dashboard.SmsBalance = ({ balance }) => (
  <div className="card card-custom">
    <div className="card-body">
      <h6 className="font-weight-normal text-yellow">SMS BALANCE</h6>
      <h2>
        {getNairaSymbol()} {balance}
      </h2>
    </div>
  </div>
);

Dashboard.SmsBalance.propTypes = {
  balance: PropTypes.any,
};

Dashboard.PendingPayments.defaultProps = {
  balance: null,
};

Dashboard.PendingPaymentRow = ({ event, id, payment }) => (
  <tr>
    <td className="pt-3">
      <Link className="text-muted-light-2" to={`/admin/pay-entertainer/${id}`}>
        {event}
      </Link>
    </td>
    <td className="text-muted-light-2">
      <Link className="text-muted-light-2" to={`/admin/pay-entertainer/${id}`}>
        {moneyFormatInNaira(payment)}
      </Link>
    </td>
  </tr>
);

Dashboard.PendingPaymentRow.propTypes = {
  event: PropTypes.string.isRequired,
  id: PropTypes.any.isRequired,
  payment: PropTypes.any.isRequired,
};

export default Dashboard;

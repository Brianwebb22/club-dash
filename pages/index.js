import Head from "next/head";
import GaugeChart from "react-gauge-chart";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";

const fetchActivities = async ({ client_id, client_secret, refresh_token }) => {
  const headers = {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
  };

  const body = JSON.stringify({
    client_id: client_id,
    client_secret: client_secret,
    refresh_token: refresh_token,
    grant_type: "refresh_token",
  });
  const reauthorizeResponse = await fetch(
    "https://www.strava.com/oauth/token",
    {
      method: "post",
      headers: headers,
      body: body,
    }
  );

  const reAuthJson = await reauthorizeResponse.json();

  const response = await fetch(
    `https://www.strava.com/api/v3/clubs/826039/activities?access_token=${reAuthJson.access_token}&page=1&per_page=100`
  );
  const json = await response.json();
  return json;
};

export async function getStaticProps() {
  const data = await fetchActivities({
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_SECRET,
    refresh_token: process.env.STRAVA_REFRESH_TOKEN,
  });
  return {
    props: {
      data,
    },
  };
}

function Content(data) {
  const activities = data.data;
  const goal = 3000;
  if (!activities) return null;

  let totalMeters = 0;
  activities.forEach((activity) => {
    totalMeters += activity.distance;
  });
  const totalMiles = (totalMeters / 1609).toFixed(0);

  const progress = totalMiles / goal;

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <GaugeChart
        arcWidth={0.25}
        colors={["black", "gold"]}
        id="gauge-chart2"
        nrOfLevels={30}
        percent={progress}
        textColor="black"
      />
      <section className={utilStyles.headingMd}>
        <p>
          We've walked, ran, and biked about {totalMiles} of our {goal} mile
          goal!
        </p>
      </section>
    </Layout>
  );
}

export default function App({ data }) {
  return <Content data={data} />;
}

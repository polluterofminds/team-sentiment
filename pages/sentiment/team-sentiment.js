import Link from 'next/link';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function TeamSentiment() {
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [sentiment, setSentiment] = useState({positivePercentage: 0, negativePercentage: 0, neutralPercentage: 0});

  useEffect(() => {
    //  Get the team name from the URL
    try {
      const encodedTeamName = window.location.href.split('=')[1];
      const teamName = decodeURI(encodedTeamName);
      setTeamName(teamName);

      checkTheFeels(teamName);
    } catch (error) {
      console.log(error);
    }    
  }, []);

  const checkTheFeels = async (teamName) => {
    //  This is where we'll make our request
    try {
      const payload = {
        teamName
      }
      const res = await axios.post('/api/team', JSON.stringify(payload), { headers: { 'Content-Type': "application/json"}});
      
      const scores = res.data;
      
      const positives = scores.filter(score => score.type === 'positive').length;
      const negatives = scores.filter(score => score.type === 'negative').length;
      const neutral = scores.filter(score => score.type === 'neutral').length;

      const positivePercentage = (positives/scores.length) * 100;
      const negativePercentage = (negatives/scores.length) * 100;
      const neutralPercentage = (neutral/scores.length) * 100; 

      const data = { positivePercentage, negativePercentage, neutralPercentage };
      setSentiment(data);
      setLoading(false); 
    } catch (error) {
      console.log(error);
    }
  }

  if(loading) {
    return (
      <div>
        <h1>Checking on all the feels for the {teamName}...</h1>
      </div>
    )
  } else {
    return (
      <div>
        <h1>Your team's sentiment</h1>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{margin: "15px"}}>
            <h3>{sentiment.positivePercentage.toFixed(2)}%</h3>
            <p>Positive</p>
          </div>
          <div style={{margin: "15px"}}>
            <h3>{sentiment.negativePercentage.toFixed(2)}%</h3>
            <p>Negative</p>
          </div>
          <div style={{margin: "15px"}}>
            <h3>{sentiment.neutralPercentage.toFixed(2)}%</h3>
            <p>Neutral</p>
          </div>
        </div>
        <Link href='/'><a>Try another team</a></Link>
      </div>
    )
  }
}

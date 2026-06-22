export const handler = async (event) => {
  if (event.httpMethod !== "POST") return {statusCode: 405};

  try {
    const {answers, level, email, shareWithJess} = JSON.parse(event.body);
    if (!email || !email.includes("@")) return {statusCode: 400, headers: {"Content-Type": "application/json"}, body: JSON.stringify({error: "Bad email"})};

    const count = Object.values(answers || {}).filter(a => a && a.trim()).length;
    if (count < 15) return {statusCode: 400, headers: {"Content-Type": "application/json"}, body: JSON.stringify({error: "Need 15 answers"})};

    fetch("https://gslqfjdu4a.execute-api.us-east-2.amazonaws.com/default/impact-logic-submit", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({answers, level, email, shareWithJess})
    }).catch(e => console.log("bg error", e));

    return {statusCode: 200, headers: {"Content-Type": "application/json"}, body: JSON.stringify({success: true})};
  } catch (e) {
    return {statusCode: 500, headers: {"Content-Type": "application/json"}, body: JSON.stringify({error: e.message})};
  }
};

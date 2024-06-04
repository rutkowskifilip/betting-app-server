const db = require("./db");
require("dotenv").config();
const perfectBet = process.env.PERFECT_BET_POINTS;
const goodBet = process.env.GOOD_BET_POINTS;
const topScorer = process.env.TOP_SCORER_POINTS;
const groupdOrder = process.env.GROUP_ORDER_POINTS;
const winners = process.env.WINNERS_POINTS;
module.exports = {
  updatePoints: async () => {
    try {
      await db.query(
        `UPDATE users AS u SET points = aggregated_data.totalPoints, perfectBets = aggregated_data.perfectBets, goodBets = aggregated_data.goodBets FROM (SELECT userId, SUM(points) AS totalPoints, SUM(CASE WHEN points IN (${perfectBet}, ${
          perfectBet * 2
        }) THEN 1 ELSE 0 END) AS perfectBets, SUM(CASE WHEN points IN (${goodBet}, ${
          goodBet * 2
        }) THEN 1 ELSE 0 END) AS goodBets FROM bets GROUP BY userId) AS aggregated_data WHERE u.id = aggregated_data.userId;`
      );
      await db.query(
        "UPDATE users AS u SET points = u.points + COALESCE(aggregated_data.totalPoints, 0) FROM (SELECT userId, SUM(points) AS totalPoints FROM (SELECT userId, points FROM winners_bets UNION ALL SELECT userId, points FROM groups_bets UNION ALL SELECT userId, points FROM topscorer_bets) AS all_bets GROUP BY userId) AS aggregated_data WHERE u.id = aggregated_data.userId;"
      );
    } catch (err) {
      console.error("Error querying database:", err);
    }
  },
  updateBetsPoints: async () => {
    console.log("here");
    try {
      await db.query("UPDATE bets SET points=0;");
      await db.query(
        `UPDATE bets b SET points = CASE WHEN m.score = b.betScore THEN ${perfectBet} * m.weight WHEN ((split_part(m.score, ':', 1) = split_part(b.betScore, ':', 1) AND split_part(m.score, ':', 2) = split_part(b.betScore, ':', 2)) OR (split_part(m.score, ':', 1) > split_part(m.score, ':', 2) AND split_part(b.betScore, ':', 1) > split_part(b.betScore,':', 2)) OR (split_part(m.score, ':', 1) < split_part(m.score, ':', 2) AND split_part(b.betScore, ':', 1) < split_part(b.betScore, ':', 2)) OR (split_part(m.score, ':', 1) = split_part(m.score, ':', 2) AND split_part(b.betScore, ':', 1) = split_part(b.betScore, ':', 2))) THEN ${goodBet} * m.weight ELSE 0 END FROM matches m WHERE b.matchId = m.id;`
      );
    } catch (err) {
      console.error("Error querying database:", err);
    }
  },
  updateGroupsPoints: async () => {
    try {
      await db.query("UPDATE groups_bets SET points=0;");
      await db.query(
        `UPDATE groups_bets gb1 SET points = gb1.points + ${groupdOrder} FROM (SELECT A FROM groups_bets WHERE userId = 1) temp WHERE gb1.A = temp.A AND temp.A IS NOT NULL AND gb1.userId <> 0;`
      );

      await db.query(
        `UPDATE groups_bets gb1 SET points = gb1.points + ${groupdOrder} FROM (SELECT B FROM groups_bets WHERE userId = 1) temp WHERE gb1.B = temp.B AND temp.B IS NOT NULL AND gb1.userId <> 0;`
      );

      await db.query(
        `UPDATE groups_bets gb1 SET points = gb1.points + ${groupdOrder} FROM (SELECT C FROM groups_bets WHERE userId = 1) temp WHERE gb1.C = temp.C AND temp.C IS NOT NULL AND gb1.userId <> 0;`
      );

      await db.query(
        `UPDATE groups_bets gb1 SET points = gb1.points + ${groupdOrder} FROM (SELECT D FROM groups_bets WHERE userId = 1) temp WHERE gb1.D = temp.D AND temp.D IS NOT NULL AND gb1.userId <> 0;`
      );

      await db.query(
        `UPDATE groups_bets gb1 SET points = gb1.points + ${groupdOrder} FROM (SELECT E FROM groups_bets WHERE userId = 1) temp WHERE gb1.E = temp.E AND temp.E IS NOT NULL AND gb1.userId <> 0;`
      );

      await db.query(
        `UPDATE groups_bets gb1 SET points = gb1.points + ${groupdOrder} FROM (SELECT F FROM groups_bets WHERE userId = 1) temp WHERE gb1.F = temp.F AND temp.F IS NOT NULL AND gb1.userId <> 0;`
      );
    } catch (err) {
      console.error("Error querying database:", err);
    }
  },
  updateTopScorerPoints: async () => {
    try {
      await db.query("UPDATE topscorer_bets SET points=0;");
      await db.query(
        `UPDATE topscorer_bets b SET points = b.points + ${topScorer} FROM (SELECT player FROM topscorer_bets WHERE userId = 1) temp WHERE b.player = temp.player AND b.userId <> 0;`
      );
    } catch (err) {
      console.error("Error querying database:", err);
    }
  },
  updateWinnersPoints: async () => {
    try {
      await db.query("UPDATE winners_bets SET points=0;");
      await db.query(
        `UPDATE winners_bets u SET points = u.points + (CASE WHEN u.first = temp.first THEN ${winners} ELSE 0 END) + (CASE WHEN u.second = temp.second THEN ${winners} ELSE 0 END) FROM (SELECT first, second FROM winners_bets WHERE userid = 1) AS temp WHERE u.userid <> 0;`
      );
    } catch (err) {
      console.error("Error querying database:", err);
    }
  },
};

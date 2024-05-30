const db = require("./db");

module.exports = {
  updatePoints: () => {
    db.query(
      "UPDATE users AS u JOIN (SELECT userId, SUM(points) AS totalPoints, SUM(CASE WHEN points IN (5, 10) THEN 1 ELSE 0 END) AS perfectBets, SUM(CASE WHEN points IN (3, 6) THEN 1 ELSE 0 END) AS goodBets FROM bets GROUP BY userId) AS aggregated_data ON u.id = aggregated_data.userId SET u.points = aggregated_data.totalPoints, u.perfectBets =  aggregated_data.perfectBets, u.goodBets = aggregated_data.goodBets;"
    );
    db.query(
      "UPDATE users AS u JOIN (SELECT userId, COALESCE(SUM(points), 0) AS totalPoints FROM (SELECT userId, points FROM winners_bets UNION ALL SELECT userId, points FROM groups_bets UNION ALL SELECT userId, points FROM topscorer_bets) AS all_bets GROUP BY userId) AS aggregated_data ON u.id = aggregated_data.userId SET u.points = u.points + aggregated_data.totalPoints;"
    );
  },
  updateBetsPoints: () => {
    db.query("UPDATE bets SET points=0;");
    db.query(
      "UPDATE bets b JOIN matches m ON b.matchId = m.id SET b.points = CASE WHEN m.score = b.betScore THEN 5 * m.weight WHEN ((SUBSTRING_INDEX(m.score, ':', 1) = SUBSTRING_INDEX(b.betScore, ':', 1) AND SUBSTRING_INDEX(m.score, ':', -1) = SUBSTRING_INDEX(b.betScore, ':', -1)) OR ((SUBSTRING_INDEX(m.score, ':', 1) > SUBSTRING_INDEX(m.score, ':', -1) AND SUBSTRING_INDEX(b.betScore, ':', 1) > SUBSTRING_INDEX(b.betScore, ':', -1)) OR (SUBSTRING_INDEX(m.score, ':', 1) < SUBSTRING_INDEX(m.score, ':', -1) AND SUBSTRING_INDEX(b.betScore, ':', 1) < SUBSTRING_INDEX(b.betScore, ':', -1)) OR (SUBSTRING_INDEX(m.score, ':', 1) = SUBSTRING_INDEX(m.score, ':', -1) AND SUBSTRING_INDEX(b.betScore, ':', 1) = SUBSTRING_INDEX(b.betScore, ':', -1)))) THEN 3 * m.weight ELSE 0 END;"
    );
  },
  updateGroupsPoints: () => {
    db.query("UPDATE groups_bets SET points=0;");
    db.query(
      "UPDATE groups_bets AS gb1 JOIN (SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = 0) AS temp ON (gb1.A = temp.A AND temp.A IS NOT NULL) SET gb1.points = gb1.points + 5 WHERE gb1.userId <> 0;"
    );
    db.query(
      "UPDATE groups_bets AS gb1 JOIN (SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = 0) AS temp ON (gb1.B = temp.B AND temp.B IS NOT NULL) SET gb1.points = gb1.points + 5 WHERE gb1.userId <> 0;"
    );
    db.query(
      "UPDATE groups_bets AS gb1 JOIN (SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = 0) AS temp ON (gb1.C = temp.C AND temp.C IS NOT NULL) SET gb1.points = gb1.points + 5 WHERE gb1.userId <> 0;"
    );
    db.query(
      "UPDATE groups_bets AS gb1 JOIN (SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = 0) AS temp ON (gb1.D = temp.D AND temp.D IS NOT NULL) SET gb1.points = gb1.points + 5 WHERE gb1.userId <> 0;"
    );
    db.query(
      "UPDATE groups_bets AS gb1 JOIN (SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = 0) AS temp ON (gb1.E = temp.E AND temp.E IS NOT NULL) SET gb1.points = gb1.points + 5 WHERE gb1.userId <> 0;"
    );
    db.query(
      "UPDATE groups_bets AS gb1 JOIN (SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = 0) AS temp ON (gb1.F = temp.F AND temp.F IS NOT NULL) SET gb1.points = gb1.points + 5 WHERE gb1.userId <> 0;"
    );
  },
  updateTopScorerPoints: () => {
    db.query("UPDATE topscorer_bets SET points=0;");
    db.query(
      "UPDATE topscorer_bets b JOIN (SELECT player FROM topScorer_bets WHERE userId = 0) temp ON b.player = temp.player SET b.points = b.points + 5 WHERE b.userId <> 0;"
    );
  },
  updateWinnersPoints: () => {
    db.query("UPDATE winners_bets SET points=0:");
    db.query(
      "UPDATE winners_bets u JOIN (SELECT first, second FROM winners_bets WHERE userId = 0) temp ON 1=1 SET u.pointss = u.pointss + (CASE WHEN u.first = temp.first THEN 5 ELSE 0 END) + (CASE WHEN u.second = temp.second THEN 5 ELSE 0 END)  WHERE u.userId <> 0;"
    );
  },
};

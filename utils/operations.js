const db = require("./db");
require("dotenv").config();
const perfectBet = process.env.PERFECT_BET_POINTS;
const goodBet = process.env.GOOD_BET_POINTS;
const topScorer = process.env.TOP_SCORER_POINTS;
const groupdOrder = process.env.GROUP_ORDER_POINTS;
const winners = process.env.WINNERS_POINTS;
module.exports = {
  updatePoints: async () => {
    await new Promise((resolve, reject) => {
      db.query("UPDATE users SET points=0;", [], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE users AS u 
                 JOIN (SELECT userId, SUM(points) AS totalPoints, 
                       SUM(CASE WHEN points IN (${perfectBet}, ${
          perfectBet * 2
        }) THEN 1 ELSE 0 END) AS perfectBets, 
                       SUM(CASE WHEN points IN (${goodBet}, ${
          goodBet * 2
        }) THEN 1 ELSE 0 END) AS goodBets 
                       FROM bets 
                       GROUP BY userId) AS aggregated_data 
                 ON u.id = aggregated_data.userId 
                 SET u.points = aggregated_data.totalPoints, 
                     u.perfectBets = aggregated_data.perfectBets, 
                     u.goodBets = aggregated_data.goodBets;`,
        [],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          // Perform the second query after the first one completes
          db.query(
            `UPDATE users AS u 
                         JOIN (SELECT userId, COALESCE(SUM(points), 0) AS totalPoints 
                               FROM (SELECT userId, points FROM winners_bets 
                                     UNION ALL 
                                     SELECT userId, points FROM groups_bets 
                                     UNION ALL 
                                     SELECT userId, points FROM topscorer_bets) AS all_bets 
                               GROUP BY userId) AS aggregated_data 
                         ON u.id = aggregated_data.userId 
                         SET u.points = u.points + aggregated_data.totalPoints;`,
            [],
            (err2, results2) => {
              if (err2) {
                return reject(err2);
              }
              resolve(results2);
            }
          );
        }
      );
    });
  },

  updateBetsPoints: () => {
    // db.query("UPDATE bets SET points=0;", [], () => {});
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE bets b JOIN matches m ON b.matchId = m.id SET b.points = CASE WHEN (m.score = '' OR  m.score = NULL) THEN 0 WHEN m.score = b.betScore THEN ${perfectBet} * m.weight WHEN ((SUBSTRING_INDEX(m.score, ':', 1) = SUBSTRING_INDEX(b.betScore, ':', 1) AND SUBSTRING_INDEX(m.score, ':', -1) = SUBSTRING_INDEX(b.betScore, ':', -1)) OR ((SUBSTRING_INDEX(m.score, ':', 1) > SUBSTRING_INDEX(m.score, ':', -1) AND SUBSTRING_INDEX(b.betScore, ':', 1) > SUBSTRING_INDEX(b.betScore, ':', -1)) OR (SUBSTRING_INDEX(m.score, ':', 1) < SUBSTRING_INDEX(m.score, ':', -1) AND SUBSTRING_INDEX(b.betScore, ':', 1) < SUBSTRING_INDEX(b.betScore, ':', -1)) OR (SUBSTRING_INDEX(m.score, ':', 1) = SUBSTRING_INDEX(m.score, ':', -1) AND SUBSTRING_INDEX(b.betScore, ':', 1) = SUBSTRING_INDEX(b.betScore, ':', -1)))) THEN ${goodBet} * m.weight ELSE 0 END;`,
        [],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
  },
  updateGroupsPoints: async () => {
    try {
      await new Promise((resolve, reject) => {
        db.query("UPDATE groups_bets SET points=0;", [], (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        });
      });

      const queries = [
        `UPDATE groups_bets AS gb1 JOIN (SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = 0) AS temp ON (gb1.A = temp.A AND temp.A IS NOT NULL) SET gb1.points = gb1.points + ${groupdOrder} WHERE gb1.userId <> 0;`,
        `UPDATE groups_bets AS gb1 JOIN (SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = 0) AS temp ON (gb1.B = temp.B AND temp.B IS NOT NULL) SET gb1.points = gb1.points + ${groupdOrder} WHERE gb1.userId <> 0;`,
        `UPDATE groups_bets AS gb1 JOIN (SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = 0) AS temp ON (gb1.C = temp.C AND temp.C IS NOT NULL) SET gb1.points = gb1.points + ${groupdOrder} WHERE gb1.userId <> 0;`,
        `UPDATE groups_bets AS gb1 JOIN (SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = 0) AS temp ON (gb1.D = temp.D AND temp.D IS NOT NULL) SET gb1.points = gb1.points + ${groupdOrder} WHERE gb1.userId <> 0;`,
        `UPDATE groups_bets AS gb1 JOIN (SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = 0) AS temp ON (gb1.E = temp.E AND temp.E IS NOT NULL) SET gb1.points = gb1.points + ${groupdOrder} WHERE gb1.userId <> 0;`,
        `UPDATE groups_bets AS gb1 JOIN (SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = 0) AS temp ON (gb1.F = temp.F AND temp.F IS NOT NULL) SET gb1.points = gb1.points + ${groupdOrder} WHERE gb1.userId <> 0;`,
      ];

      for (const query of queries) {
        await new Promise((resolve, reject) => {
          db.query(query, [], (err, results) => {
            if (err) {
              return reject(err);
            }
            resolve(results);
          });
        });
      }
    } catch (error) {
      throw new Error("Error updating groups points: " + error.message);
    }
  },

  updateTopScorerPoints: async () => {
    await new Promise((resolve, reject) => {
      db.query("UPDATE topscorer_bets SET points=0;", [], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });

    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE topscorer_bets b JOIN (SELECT player FROM topscorer_bets WHERE userId = 0) temp ON b.player = temp.player SET b.points = ${topScorer} WHERE b.userId <> 0;`,
        [],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
  },
  updateWinnersPoints: async () => {
    // db.query("UPDATE winners_bets SET points=0;", [], () => {});
    await new Promise((resolve, reject) => {
      db.query("UPDATE winners_bets SET points=0;", [], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE winners_bets u JOIN (SELECT first, second FROM winners_bets WHERE userId = 0) temp ON 1=1 SET u.points = (CASE WHEN u.first = temp.first THEN ${winners} ELSE 0 END) + (CASE WHEN u.second = temp.second THEN ${winners} ELSE 0 END)  WHERE u.userId <> 0;`,
        [],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
  },
};

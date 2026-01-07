import React, { useState } from "react";
import { FiChevronDown, FiEdit2, FiBookmark } from "react-icons/fi";

export default function Home() {
  const [range, setRange] = useState("this_week");

  return (
    <>
        <section className="card">
          <div className="cardHead">
            <div className="cardTitle">Quick overview</div>
            <button
              className="select"
              type="button"
              onClick={() =>
                setRange((r) => (r === "this_week" ? "this_month" : "this_week"))
              }
            >
              <span className="selectText">{range === "this_week" ? "This week" : "This month"}</span>
              <FiChevronDown />
            </button>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="statValue">12.4 KM</div>
              <div className="statLabel">This week</div>
            </div>
            <div className="stat">
              <div className="statValue">4 RUNS</div>
              <div className="statLabel">Total</div>
            </div>
            <div className="stat">
              <div className="statValue">2H:30M</div>
              <div className="statLabel">Hours activate</div>
            </div>
          </div>

          {/* Hidden dropdown behavior not implemented per spec */}
          <input type="hidden" value={range} onChange={() => {}} />
        </section>

        <section className="card">
          <div className="cardHead">
            <div className="cardTitle">Monthly goal</div>
            <button className="change" type="button">
              <span>Change</span>
              <FiEdit2 />
            </button>
          </div>

          <div className="goalRow">
            <div className="goalLeft">
              <div className="target" aria-hidden="true" />
              <div className="goalText">
                <span className="goalNow">18</span>
                <span className="goalSlash">/</span>
                <span className="goalTotal">100 KM</span>
              </div>
            </div>

            <div className="goalBar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={18}>
              <div className="goalFill" style={{ width: "18%" }} />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="sectionHead">
            <div className="sectionTitle">Recent activities</div>
            <button className="seeAll" type="button">
              See all
            </button>
          </div>

          <div className="activity">
            <div className="activityTop">
              <div>
                <div className="activityTitle">Morning run</div>
                <div className="activitySub">Today, 7:30 AM</div>
              </div>
            </div>

            <div className="activityStats">
              <div className="mini">
                <div className="miniValue">5 KM</div>
                <div className="miniLabel">Distance</div>
              </div>
              <div className="mini">
                <div className="miniValue">33.11/KM</div>
                <div className="miniLabel">Pace</div>
              </div>
              <div className="mini">
                <div className="miniValue">30M</div>
                <div className="miniLabel">Time</div>
              </div>
            </div>

            <div className="map" aria-hidden="true" />
          </div>
        </section>

        <section className="card program">
          <div className="programHero">
            <div className="programBadge" aria-hidden="true">
              21K
              <div className="programBadgeSub">HALF MARATHON</div>
            </div>
          </div>

          <div className="programBody">
            <div className="programTop">
              <div>
                <div className="programTitle">First Half Marathon</div>
                <div className="programSub">
                  This 21.1 km workout is designed for runners building toward their first half marathon.
                </div>
              </div>
              <div className="programTag">Beginners</div>
            </div>

            <button className="btnPrimary" type="button">
              Start now
            </button>
          </div>
        </section>

        <section className="section">
          <div className="sectionHead">
            <div className="sectionTitle">Challenges</div>
            <button className="seeAll" type="button">
              See all
            </button>
          </div>

          <div className="grid">
            <div className="challenge">
              <div className="challengeTop">
                <div className="chip" aria-hidden="true">
                  50 KM
                </div>
                <button className="bookmark" type="button" aria-label="Bookmark">
                  <FiBookmark />
                </button>
              </div>
              <div className="challengeTitle">Run 50 km in 10 days</div>
              <div className="challengeSub">May 2 - May 12</div>
              <button className="btnPrimary" type="button">
                Start now
              </button>
            </div>

            <div className="challenge">
              <div className="challengeTop">
                <div className="chip" aria-hidden="true">
                  5 DAYS
                </div>
                <button className="bookmark" type="button" aria-label="Bookmark">
                  <FiBookmark />
                </button>
              </div>
              <div className="challengeTitle">Run every day for 5 days</div>
              <div className="challengeSub">May 2 - May 12</div>
              <button className="btnPrimary" type="button">
                Start now
              </button>
            </div>
          </div>
        </section>
      <style>{styles}</style>
    </>
  );
}

const styles = `
.card{
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
}

.card + .card{ margin-top: 12px; }

.cardHead{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap: 10px;
  margin-bottom: 10px;
}

.cardTitle{ font-weight: 800; font-size: 14px; }

.select{
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,.14);
  background: rgba(255,255,255,.7);
  padding: 0 10px;
  display:flex;
  align-items:center;
  gap: 8px;
  cursor:pointer;
}

.selectText{ font-size: 13px; color: var(--text); }

.change{
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,.14);
  background: rgba(255,255,255,.7);
  padding: 0 10px;
  display:flex;
  align-items:center;
  gap: 8px;
  cursor:pointer;
  font-weight: 600;
}

.stats{
  display:grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.statValue{ font-weight: 900; font-size: 20px; letter-spacing: .01em; }
.statLabel{ color: var(--muted); font-size: 12px; margin-top: 4px; }

.goalRow{ display:flex; align-items:center; gap: 12px; }

.goalLeft{ display:flex; align-items:center; gap: 10px; min-width: 128px; }

.target{
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(0,0,0,.08);
}

.goalText{ font-weight: 900; }
.goalNow{ font-size: 16px; }
.goalSlash{ opacity: .5; margin: 0 2px; }
.goalTotal{ font-size: 14px; }

.goalBar{
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: rgba(0,0,0,.10);
  overflow:hidden;
}

.goalFill{ height: 100%; background: rgba(0,0,0,.55); border-radius: 999px; }

.section{ margin-top: 12px; }

.sectionHead{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin: 4px 2px 10px;
}

.sectionTitle{ font-weight: 900; font-size: 18px; }

.seeAll{
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor:pointer;
  font-weight: 600;
}

.activity{
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow:hidden;
}

.activityTop{ padding: 12px 12px 6px; }
.activityTitle{ font-weight: 900; font-size: 16px; }
.activitySub{ color: var(--muted); font-size: 12px; margin-top: 2px; }

.activityStats{
  padding: 10px 12px 12px;
  display:grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.miniValue{ font-weight: 900; font-size: 14px; }
.miniLabel{ color: var(--muted); font-size: 11px; margin-top: 2px; }

.map{
  height: 140px;
  background: linear-gradient(90deg, rgba(0,0,0,.08), rgba(0,0,0,.04));
}

.program{ padding: 0; overflow:hidden; }

.programHero{
  height: 120px;
  background: rgba(0,0,0,.10);
  display:flex;
  align-items:center;
  justify-content:center;
}

.programBadge{
  width: 104px;
  height: 104px;
  border-radius: 999px;
  background: rgba(255,255,255,.75);
  border: 1px solid rgba(0,0,0,.14);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  font-weight: 900;
  font-size: 22px;
}

.programBadgeSub{ font-size: 10px; font-weight: 800; margin-top: 2px; letter-spacing: .02em; }

.programBody{ padding: 12px; }

.programTop{
  display:flex;
  justify-content:space-between;
  gap: 10px;
  align-items:flex-start;
}

.programTitle{ font-weight: 900; font-size: 18px; }
.programSub{ color: var(--muted); font-size: 12px; margin-top: 6px; line-height: 1.35; }

.programTag{
  height: 24px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,.14);
  background: rgba(255,255,255,.7);
  font-size: 12px;
  font-weight: 700;
  display:flex;
  align-items:center;
  white-space: nowrap;
}

.btnPrimary{
  margin-top: 10px;
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: var(--primary);
  font-weight: 800;
  cursor:pointer;
}

.grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.challenge{
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px;
  display:flex;
  flex-direction:column;
  gap: 8px;
}

.challengeTop{ display:flex; justify-content:space-between; align-items:center; }

.chip{
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.14);
  background: rgba(255,255,255,.85);
  font-size: 11px;
  font-weight: 900;
  display:flex;
  align-items:center;
}

.bookmark{
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.14);
  background: rgba(255,255,255,.8);
  display:grid;
  place-items:center;
  cursor:pointer;
}

.bookmark svg{ width: 16px; height: 16px; }

.challengeTitle{ font-weight: 900; font-size: 13px; line-height: 1.25; }
.challengeSub{ color: var(--muted); font-size: 11px; }

@media (max-width: 380px){
  .stats{ grid-template-columns: 1fr; }
  .grid{ grid-template-columns: 1fr; }
}

@media (min-width: 768px){
  .statValue{ font-size: 22px; }
  .map{ height: 180px; }
}
`;
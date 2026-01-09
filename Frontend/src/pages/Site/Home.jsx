import React, { useState } from "react";
import { FiChevronDown, FiEdit2, FiBookmark } from "react-icons/fi";

export default function Home() {
  const [range, setRange] = useState("this_week");

  return (
    <>
      {/* Quick overview */}
      <section className="bg-white border border-black/20 rounded-[14px] p-3">
        <div className="flex items-center justify-between gap-2.5 mb-2.5">
          <div className="font-extrabold text-[14px]">Quick overview</div>

          <button
            className="h-8 rounded-[10px] border border-black/15 bg-white/70 px-2.5 flex items-center gap-2 cursor-pointer"
            type="button"
            onClick={() =>
              setRange((r) => (r === "this_week" ? "this_month" : "this_week"))
            }
          >
            <span className="text-[13px] text-black">
              {range === "this_week" ? "This week" : "This month"}
            </span>
            <FiChevronDown />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 max-[380px]:grid-cols-1">
          <div>
            <div className="font-black text-[20px] tracking-[.01em] md:text-[22px]">
              12.4 KM
            </div>
            <div className="text-black/60 text-[12px] mt-1">This week</div>
          </div>

          <div>
            <div className="font-black text-[20px] tracking-[.01em] md:text-[22px]">
              4 RUNS
            </div>
            <div className="text-black/60 text-[12px] mt-1">Total</div>
          </div>

          <div>
            <div className="font-black text-[20px] tracking-[.01em] md:text-[22px]">
              2H:30M
            </div>
            <div className="text-black/60 text-[12px] mt-1">Hours activate</div>
          </div>
        </div>

        <input type="hidden" value={range} onChange={() => {}} />
      </section>

      {/* Monthly goal */}
      <section className="bg-white border border-black/20 rounded-[14px] p-3 mt-3">
        <div className="flex items-center justify-between gap-2.5 mb-2.5">
          <div className="font-extrabold text-[14px]">Monthly goal</div>

          <button
            className="h-8 rounded-[10px] border border-black/15 bg-white/70 px-2.5 flex items-center gap-2 cursor-pointer font-semibold"
            type="button"
          >
            <span>Change</span>
            <FiEdit2 />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-[128px]">
            <div
              className="w-7 h-7 rounded-full bg-black/10"
              aria-hidden="true"
            />
            <div className="font-black">
              <span className="text-[16px]">18</span>
              <span className="opacity-50 mx-[2px]">/</span>
              <span className="text-[14px]">100 KM</span>
            </div>
          </div>

          <div
            className="flex-1 h-2 rounded-full bg-black/10 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={18}
          >
            <div
              className="h-full rounded-full bg-black/55"
              style={{ width: "18%" }}
            />
          </div>
        </div>
      </section>

      {/* Recent activities */}
      <section className="mt-3">
        <div className="flex items-center justify-between my-1 mx-0.5 mb-2.5">
          <div className="font-black text-[18px]">Recent activities</div>
          <button
            className="border-0 bg-transparent text-black/60 cursor-pointer font-semibold"
            type="button"
          >
            See all
          </button>
        </div>

        <div className="bg-white border border-black/20 rounded-[14px] overflow-hidden">
          <div className="px-3 pt-3 pb-1.5">
            <div className="font-black text-[16px]">Morning run</div>
            <div className="text-black/60 text-[12px] mt-0.5">
              Today, 7:30 AM
            </div>
          </div>

          <div className="px-3 pt-2.5 pb-3 grid grid-cols-3 gap-2.5">
            <div>
              <div className="font-black text-[14px]">5 KM</div>
              <div className="text-black/60 text-[11px] mt-0.5">Distance</div>
            </div>
            <div>
              <div className="font-black text-[14px]">33.11/KM</div>
              <div className="text-black/60 text-[11px] mt-0.5">Pace</div>
            </div>
            <div>
              <div className="font-black text-[14px]">30M</div>
              <div className="text-black/60 text-[11px] mt-0.5">Time</div>
            </div>
          </div>

          <div
            className="h-[140px] md:h-[180px] bg-gradient-to-r from-black/10 to-black/5"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* Program card */}
      <section className="bg-white border border-black/20 rounded-[14px] mt-3 p-0 overflow-hidden">
        <div className="h-[120px] bg-black/10 flex items-center justify-center">
          <div className="w-[104px] h-[104px] rounded-full bg-white/75 border border-black/15 flex flex-col items-center justify-center font-black text-[22px]">
            21K
            <div className="text-[10px] font-extrabold mt-0.5 tracking-[.02em]">
              HALF MARATHON
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="flex justify-between gap-2.5 items-start">
            <div>
              <div className="font-black text-[18px]">First Half Marathon</div>
              <div className="text-black/60 text-[12px] mt-1.5 leading-[1.35]">
                This 21.1 km workout is designed for runners building toward
                their first half marathon.
              </div>
            </div>

            <div className="h-6 px-2.5 rounded-[10px] border border-black/15 bg-white/70 text-[12px] font-bold flex items-center whitespace-nowrap">
              Beginners
            </div>
          </div>

          <button
            className="mt-2.5 w-full h-11 rounded-xl border border-transparent bg-[var(--primary)] font-extrabold cursor-pointer"
            type="button"
          >
            Start now
          </button>
        </div>
      </section>

      {/* Challenges */}
      <section className="mt-3">
        <div className="flex items-center justify-between my-1 mx-0.5 mb-2.5">
          <div className="font-black text-[18px]">Challenges</div>
          <button
            className="border-0 bg-transparent text-black/60 cursor-pointer font-semibold"
            type="button"
          >
            See all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 max-[380px]:grid-cols-1">
          {/* Card 1 */}
          <div className="bg-white border border-black/20 rounded-[14px] p-2.5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="h-7 px-2.5 rounded-full border border-black/15 bg-white/85 text-[11px] font-black flex items-center">
                50 KM
              </div>

              <button
                className="w-[34px] h-[34px] rounded-full border border-black/15 bg-white/80 grid place-items-center cursor-pointer"
                type="button"
                aria-label="Bookmark"
              >
                <FiBookmark className="w-4 h-4" />
              </button>
            </div>

            <div className="font-black text-[13px] leading-[1.25]">
              Run 50 km in 10 days
            </div>
            <div className="text-black/60 text-[11px]">May 2 - May 12</div>

            <button
              className="w-full h-11 rounded-xl border border-transparent bg-[var(--primary)] font-extrabold cursor-pointer"
              type="button"
            >
              Start now
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-black/20 rounded-[14px] p-2.5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="h-7 px-2.5 rounded-full border border-black/15 bg-white/85 text-[11px] font-black flex items-center">
                5 DAYS
              </div>

              <button
                className="w-[34px] h-[34px] rounded-full border border-black/15 bg-white/80 grid place-items-center cursor-pointer"
                type="button"
                aria-label="Bookmark"
              >
                <FiBookmark className="w-4 h-4" />
              </button>
            </div>

            <div className="font-black text-[13px] leading-[1.25]">
              Run every day for 5 days
            </div>
            <div className="text-black/60 text-[11px]">May 2 - May 12</div>

            <button
              className="w-full h-11 rounded-xl border border-transparent bg-[var(--primary)] font-extrabold cursor-pointer"
              type="button"
            >
              Start now
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

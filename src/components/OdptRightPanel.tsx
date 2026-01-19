import React, { useEffect, useMemo, useState } from "react";
import { Bus, Clock, ChevronDown, ChevronUp, Radio } from "lucide-react";
import { fetchBusroutePattern, fetchBusTimetable } from "../api/odpt";

type OdptDepartureItem = {
    title: string;
    departureTime: string;
    timetable?: any;
    tableTitle?: string;
};

type OdptPatternItem = {
    title: string;
    stops: string[];
    raw?: any;
};

type Props = {
    titles: string[];
    operator?: string;
};

function parseToDate(timeStr: string, isMidnight?: boolean) {
    const [hh, mm] = (timeStr || "00:00").split(":").map((v) => parseInt(v, 10));
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
    if (isMidnight) d.setDate(d.getDate() + 1);
    return d;
}

export function OdptRightPanel({
    titles,
    operator = "odpt.Operator:KokusaiKogyoBus",
}: Props) {
    const envKey = ((import.meta as any).env && (import.meta as any).env.VITE_ODPT_KEY) || "";
    const consumerKey = envKey as string;

    const [patterns, setPatterns] = useState<OdptPatternItem[]>([]);
    const [departures, setDepartures] = useState<OdptDepartureItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedTitle, setSelectedTitle] = useState<string>(() => titles[0] ?? "");
    const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
    const [expandedDepartureIndex, setExpandedDepartureIndex] = useState<number | null>(0);

    useEffect(() => {
        setSelectedTitle(titles[0] ?? "");
    }, [titles.join(",")]);

    useEffect(() => {
        if (!consumerKey) {
            setPatterns([]);
            setDepartures([]);
            setLoading(false);
            setError(null);
            return;
        }
        if (!titles || titles.length === 0) {
            setPatterns([]);
            setDepartures([]);
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        const now = new Date();

        Promise.all([
            // Patterns
            Promise.all(
                titles.map(async (t) => {
                    const data = await fetchBusroutePattern({ consumerKey, title: t, operator });
                    const arr = Array.isArray(data) ? data : data ? [data] : [];
                    const first = arr[0];
                    const orders = (first && first["odpt:busstopPoleOrder"]) || [];
                    const stops: string[] = orders
                        .map((o: any) => o?.["odpt:note"])
                        .filter(Boolean)
                        .map((note: string) => String(note).split(":")[0])
                        .filter((s: string) => s.trim().length > 0);
                    return { title: t, stops, raw: first } satisfies OdptPatternItem;
                })
            ),
            // Departures
            Promise.all(
                titles.map(async (t) => {
                    const data = await fetchBusTimetable({ consumerKey, title: t, operator });
                    const arr = Array.isArray(data) ? data : data ? [data] : [];
                    return { title: t, timetables: arr };
                })
            ),
        ])
            .then(([patternItems, timetableItems]) => {
                if (cancelled) return;

                setPatterns(patternItems);

                const upcoming: OdptDepartureItem[] = [];
                timetableItems.forEach(({ title: t, timetables }) => {
                    timetables.forEach((timetable: any) => {
                        const objects: any[] = timetable?.["odpt:busTimetableObject"] || [];
                        if (objects.length === 0) return;
                        // NOTE: 現状の実装に合わせて objects[0] を採用（チームのコンソール出力仕様と同じ）
                        const obj = objects[0];
                        const departureTime = obj?.["odpt:departureTime"];
                        const isMidnight = obj?.["odpt:isMidnight"];
                        if (!departureTime) return;
                        const depDate = parseToDate(departureTime, isMidnight);
                        if (depDate >= now) {
                            upcoming.push({
                                title: t,
                                departureTime,
                                timetable,
                                tableTitle: timetable?.["dc:title"] || timetable?.["odpt:busroutePattern"] || t,
                            });
                        }
                    });
                });

                const sorted = upcoming.sort((a, b) => {
                    const dA = parseToDate(a.departureTime);
                    const dB = parseToDate(b.departureTime);
                    return dA.getTime() - dB.getTime();
                });

                setDepartures(sorted.slice(0, 3));
                setExpandedDepartureIndex(sorted.length > 0 ? 0 : null);
            })
            .catch((e) => {
                if (cancelled) return;
                setError(e instanceof Error ? e.message : String(e));
                setPatterns([]);
                setDepartures([]);
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [consumerKey, operator, titles.join(",")]);

    const selectedStops = useMemo(() => {
        if (!selectedTitle) return [];
        return patterns.find((p) => p.title === selectedTitle)?.stops ?? [];
    }, [patterns, selectedTitle]);

    const keyMissing = !consumerKey;

    return (
        <div className="space-y-6">
            {/* 運行系統 */}
            <div className="bg-white rounded-2xl overflow-hidden p-4">
                <div className="mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
                            <Bus className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-lg text-gray-900 font-semibold">運行系統</h2>
                    </div>
                </div>

                {keyMissing ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                        ODPT APIキーが未設定です。ターミナルで{" "}
                        <code className="px-1 py-0.5 bg-amber-100 rounded">export VITE_ODPT_KEY="..."</code>{" "}
                        を実行してから dev サーバーを起動してください。
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                        ODPTの取得に失敗しました: {error}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {titles.map((t) => {
                            const isExpanded = expandedTitle === t;
                            return (
                                <div key={t} className="space-y-2">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                        <div className="px-3 py-2 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0 bg-green-600">
                                            {t}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <span className="text-sm text-gray-700 font-medium block">{t}</span>
                                            <span className="text-xs text-gray-500">国際興業バス</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedTitle(t);
                                                setExpandedTitle((prev) => (prev === t ? null : t));
                                            }}
                                            className="flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-all active:scale-95 font-medium"
                                        >
                                            途中の停留所
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="ml-3 animate-in slide-in-from-top-2 duration-200">
                                            <div className="bg-gray-50 rounded-xl p-4 text-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-gray-700">停車バス停一覧</span>
                                                    <button
                                                        className="text-xs text-gray-500 hover:text-gray-700"
                                                        onClick={() => setExpandedTitle(null)}
                                                    >
                                                        閉じる
                                                    </button>
                                                </div>
                                                {loading ? (
                                                    <div className="text-gray-500">読み込み中...</div>
                                                ) : (
                                                    <ol className="space-y-2">
                                                        {(patterns.find((p) => p.title === t)?.stops ?? []).map((name, idx) => (
                                                            <li key={`${t}-${idx}`} className="flex items-start gap-3">
                                                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                    {idx + 1}
                                                                </div>
                                                                <div className="text-gray-800">{name}</div>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 発車時刻 */}
            <div className="bg-white rounded-2xl overflow-hidden p-4">
                <div className="mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-lg text-gray-900 font-semibold">発車時刻</h2>
                    </div>
                </div>

                {keyMissing ? (
                    <div className="p-6 text-center text-sm text-gray-600">
                        APIキーが未設定のため、発車時刻を表示できません。
                    </div>
                ) : loading ? (
                    <div className="p-6 text-center text-sm text-gray-600">読み込み中...</div>
                ) : departures.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-600">直近の発車が見つかりませんでした。</div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {departures.map((d, idx) => {
                            const isExpanded = expandedDepartureIndex === idx;
                            const isNext = idx === 0;
                            return (
                                <div key={`${d.title}-${d.departureTime}-${idx}`} className="transition-all duration-300">
                                    <div
                                        onClick={() => setExpandedDepartureIndex((prev) => (prev === idx ? null : idx))}
                                        className={`p-5 rounded-2xl shadow-lg cursor-pointer transition-all active:scale-[0.98] ${isNext ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-white border border-gray-200 hover:border-blue-300"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {isNext ? (
                                                    <>
                                                        <Radio className="w-4 h-4 text-white animate-pulse" />
                                                        <span className="text-xs text-white font-semibold uppercase tracking-wide">次の発車</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">発車予定</span>
                                                    </>
                                                )}
                                            </div>
                                            {isNext ? (
                                                isExpanded ? <ChevronUp className="w-4 h-4 text-white/80" /> : <ChevronDown className="w-4 h-4 text-white/80" />
                                            ) : (
                                                isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>

                                        <div className="flex items-baseline gap-3 mb-3">
                                            <span className={`text-4xl font-bold ${isNext ? "text-white" : "text-gray-900"}`}>{d.departureTime}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${isNext ? "bg-white text-blue-600" : "bg-gray-100 text-gray-700"}`}>
                                                {d.title}
                                            </span>
                                            <span className={`text-sm font-medium ${isNext ? "text-white" : "text-gray-700"}`}>{d.tableTitle ?? ""}</span>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-2 ml-2 pl-4 border-l-2 border-gray-200 animate-in slide-in-from-top-2 duration-200">
                                            <div className="bg-gray-50 rounded-xl p-4 text-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-gray-700">停車バス停一覧</span>
                                                    <button
                                                        className="text-xs text-gray-500 hover:text-gray-700"
                                                        onClick={() => {
                                                            setSelectedTitle(d.title);
                                                            setExpandedTitle(d.title);
                                                        }}
                                                    >
                                                        この系統を開く
                                                    </button>
                                                </div>
                                                <ol className="space-y-2">
                                                    {selectedStops.map((name, sIdx) => (
                                                        <li key={`${selectedTitle}-${sIdx}`} className="flex items-start gap-3">
                                                            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                {sIdx + 1}
                                                            </div>
                                                            <div className="text-gray-800">{name}</div>
                                                        </li>
                                                    ))}
                                                    {selectedStops.length === 0 && <div className="text-gray-500">停車バス停情報がありません。</div>}
                                                </ol>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}



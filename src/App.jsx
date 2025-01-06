import React, { useState } from "react";

// ------------------ 1. 役リスト ------------------
const yakuList = [
  // 1翻
  { name: "リーチ (立直)", hanClosed: 1, hanOpen: 0 },
  { name: "タンヤオ (断么九)", hanClosed: 1, hanOpen: 1 },
  { name: "ピンフ (平和)", hanClosed: 1, hanOpen: 0 },
  { name: "一盃口 (イーペーコー)", hanClosed: 1, hanOpen: 0 },
  { name: "自風牌・場風牌・三元牌 (役牌)", hanClosed: 1, hanOpen: 1 },

  // 2翻
  { name: "ダブルリーチ (ダブリー)", hanClosed: 2, hanOpen: 0 },
  { name: "対々和 (トイトイホー)", hanClosed: 2, hanOpen: 2 },
  { name: "三暗刻 (サンアンコー)", hanClosed: 2, hanOpen: 2 },
  { name: "三槓子 (サンカンツ)", hanClosed: 2, hanOpen: 2 },
  { name: "小三元 (ショウサンゲン)", hanClosed: 2, hanOpen: 2 },
  { name: "混老頭 (ホンロウトウ)", hanClosed: 2, hanOpen: 2 },
  { name: "七対子 (チートイツ)", hanClosed: 2, hanOpen: 0 },

  // 3翻
  { name: "混一色 (ホンイーツ)", hanClosed: 3, hanOpen: 2 },
  { name: "純全帯么九 (ジュンチャン)", hanClosed: 3, hanOpen: 2 },
  { name: "二盃口 (リャンペーコー)", hanClosed: 3, hanOpen: 0 },

  // 6翻
  { name: "清一色 (チンイーツ)", hanClosed: 6, hanOpen: 5 },

  // 役満
  { name: "国士無双 (コクシムソウ)", hanClosed: 13, hanOpen: 13 },
  { name: "四暗刻 (スーアンコー)", hanClosed: 13, hanOpen: 13 },
  { name: "大三元 (ダイサンゲン)", hanClosed: 13, hanOpen: 13 },
  { name: "小四喜 (ショウスーシー)", hanClosed: 13, hanOpen: 13 },
  { name: "大四喜 (ダイスーシー)", hanClosed: 13, hanOpen: 13 },
  { name: "字一色 (ツーイーソー)", hanClosed: 13, hanOpen: 13 },
  { name: "緑一色 (リューイーソー)", hanClosed: 13, hanOpen: 13 },
  { name: "清老頭 (チンロウトウ)", hanClosed: 13, hanOpen: 13 },
  { name: "九蓮宝燈 (チューレンポートウ)", hanClosed: 13, hanOpen: 13 },
  { name: "四槓子 (スーカンツ)", hanClosed: 13, hanOpen: 13 },
];

// ------------------ 2. 得点計算ロジック ------------------
// Dora・一発を考慮し、翻数に加算します。
const calculateScore = (han, fu) => {
  // 役満チェック
  if (han >= 13) {
    return 32000; // 簡易的に一律 32000 点
  }
  // 基本点
  const basePoint = fu * Math.pow(2, 2 + han);

  // 満貫以上チェック
  if (han === 5) {
    return 8000; // 5翻→満貫
  } else if (han >= 6 && han <= 7) {
    return 12000; // 跳満
  } else if (han >= 8 && han <= 10) {
    return 16000; // 倍満
  } else if (han >= 11 && han <= 12) {
    return 24000; // 三倍満
  }

  // 4翻以下 → basePoint を100点単位で切り上げ
  return Math.ceil(basePoint / 100) * 100;
};

// ------------------ 3. ジョーク機能（もし賭けていたら…） ------------------
function calculateGamblingImpact({ score, isParent, isTsumo, isWinner, rate }) {
  let baseMoney = 0;

  if (isWinner) {
    // 自分が和了
    if (isTsumo) {
      // ツモ→3人(または2人)から
      let total = score * 3;
      if (isParent) {
        total = Math.round(score * 3.5); // 親ツモはやや多め
      }
      baseMoney = total * rate;
    } else {
      // ロン→放銃者1人、親なら1.5倍
      baseMoney = score * (isParent ? 1.5 : 1) * rate;
    }
  } else {
    // 自分が放銃・負け
    if (isTsumo) {
      // 相手ツモ→3人で分担、親なら負担増
      let pay = Math.round((score * rate) / 3);
      if (isParent) {
        pay = Math.round((score * rate) / 2);
      }
      baseMoney = -pay;
    } else {
      // ロン放銃
      baseMoney = -(score * (isParent ? 1.5 : 1) * rate);
    }
  }

  // 整数に丸める
  baseMoney = Math.round(baseMoney);

  if (isWinner) {
    return `もし賭けていたら +${baseMoney}円くらい勝ってたかも？`;
  } else {
    return `もし賭けていたら ${baseMoney}円くらい負けてたかも…`;
  }
}

// ------------------ 4. メインコンポーネント ------------------
function App() {
  // ローディング管理用のステート
  const [isLoading, setIsLoading] = useState(false);

  // 役選択
  const [selectedYaku, setSelectedYaku] = useState([]);
  // 門前 or 副露
  const [isClosedHand, setIsClosedHand] = useState(true);
  // 符
  const [fu, setFu] = useState(30);

  // 親 or 子
  const [isParent, setIsParent] = useState(false);
  // ツモ or ロン
  const [isTsumo, setIsTsumo] = useState(false);
  // 勝ち or 負け
  const [isWinner, setIsWinner] = useState(true);
  // レート
  const [rate, setRate] = useState(4);

  // ドラ枚数
  const [dora, setDora] = useState(0);
  // 一発の有無
  const [isIppatsu, setIsIppatsu] = useState(false);

  // 計算結果
  const [score, setScore] = useState(null);
  // ジョークメッセージ
  const [joke, setJoke] = useState("");

  // 役のチェック/アンチェック
  const handleYakuChange = (yakuName) => {
    if (selectedYaku.includes(yakuName)) {
      setSelectedYaku(selectedYaku.filter((name) => name !== yakuName));
    } else {
      setSelectedYaku([...selectedYaku, yakuName]);
    }
  };

  // 計算ボタン押下
  const handleCalculateScore = () => {
    setIsLoading(true);
    setScore(null);
    setJoke("");

    // 演出用に1秒ディレイ
    setTimeout(() => {
      // 1) 選択された役から合計翻数を算出
      let totalHan = 0;
      selectedYaku.forEach((yName) => {
        const y = yakuList.find((item) => item.name === yName);
        if (y) {
          totalHan += isClosedHand ? y.hanClosed : y.hanOpen;
        }
      });

      // 2) ドラと一発を加算
      //    ドラ枚数分を翻に上乗せ、一発なら+1翻
      totalHan += dora; 
      if (isIppatsu) {
        totalHan += 1;
      }

      // 3) 得点計算
      const finalScore = calculateScore(totalHan, fu);
      setScore(finalScore);

      // 4) ジョーク機能
      const text = calculateGamblingImpact({
        score: finalScore,
        isParent,
        isTsumo,
        isWinner,
        rate,
      });
      setJoke(text);

      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 下層：アニメーションするカラフルグラデーション */}
      <div
        className="
          absolute inset-0
          bg-gradient-flow
          bg-[length:200%_200%]
          animate-gradientFlow
        "
      />
      {/* 上層：ダークグラデーション＋コンテンツ */}
      <div className="relative min-h-screen bg-gradient-dark text-white flex flex-col">
        {/* ヘッダー */}
        <header className="bg-black bg-opacity-25 p-4">
          <h1 className="text-center text-xl font-light">
            麻雀 点数計算アプリ
          </h1>
        </header>

        <main className="flex flex-1 p-4 gap-4">
          {/* 左カラム（手牌設定・役一覧） */}
          <section className="w-72 flex-shrink-0 space-y-4">
            {/* 手牌の設定 */}
            <div className="bg-white bg-opacity-10 rounded p-4 space-y-3">
              <h2 className="text-lg font-semibold mb-2">手牌設定</h2>

              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-500"
                  checked={isClosedHand}
                  onChange={() => setIsClosedHand(!isClosedHand)}
                />
                <span>門前(鳴き無し)</span>
              </label>

              <label className="flex items-center space-x-2">
                <span>符:</span>
                <input
                  type="number"
                  className="w-16 p-1 rounded text-black"
                  value={fu}
                  onChange={(e) => setFu(parseInt(e.target.value, 10))}
                />
              </label>

              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-500"
                  checked={isParent}
                  onChange={() => setIsParent(!isParent)}
                />
                <span>親(東家)</span>
              </label>

              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-500"
                  checked={isTsumo}
                  onChange={() => setIsTsumo(!isTsumo)}
                />
                <span>ツモあがり</span>
              </label>

              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-500"
                  checked={isWinner}
                  onChange={() => setIsWinner(!isWinner)}
                />
                <span>自分が和了(勝ち)</span>
              </label>

              <label className="flex items-center space-x-2">
                <span>レート(円/点):</span>
                <input
                  type="number"
                  className="w-16 p-1 rounded text-black"
                  value={rate}
                  onChange={(e) => setRate(parseInt(e.target.value, 10))}
                />
              </label>

              {/* ドラ枚数 */}
              <label className="flex items-center space-x-2">
                <span>ドラ枚数:</span>
                <input
                  type="number"
                  className="w-16 p-1 rounded text-black"
                  value={dora}
                  onChange={(e) => setDora(parseInt(e.target.value, 10))}
                />
              </label>

              {/* 一発の有無 */}
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-500"
                  checked={isIppatsu}
                  onChange={() => setIsIppatsu(!isIppatsu)}
                />
                <span>一発</span>
              </label>
            </div>

            {/* 役一覧 */}
            <div className="bg-white bg-opacity-10 rounded p-4 max-h-[300px] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-2">役一覧</h2>
              <ul className="space-y-1">
                {yakuList.map((yaku) => (
                  <li key={yaku.name}>
                    <label className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-500"
                        checked={selectedYaku.includes(yaku.name)}
                        onChange={() => handleYakuChange(yaku.name)}
                      />
                      <span>{yaku.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* 計算ボタン */}
            <button
              onClick={handleCalculateScore}
              className={`w-full bg-orange-500 hover:bg-orange-600 transition-colors text-white font-bold py-2 px-4 rounded ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "計算中..." : "点数を計算"}
            </button>
          </section>

          {/* 右カラム（結果表示） */}
          <section className="flex-1">
            <div className="bg-white bg-opacity-10 rounded p-4 h-full relative">
              <h2 className="text-lg font-semibold mb-2">結果</h2>

              {/* ローディングスピナー */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                  <div className="animate-spin border-4 border-orange-500 border-t-transparent rounded-full w-10 h-10"></div>
                </div>
              )}

              {score === null && !isLoading ? (
                <p className="text-gray-200">まだ計算されていません</p>
              ) : (
                !isLoading &&
                score !== null && (
                  <div className="opacity-0 animate-fadeIn">
                    <p className="text-xl font-bold mt-2">
                      合計点:{" "}
                      <span className="text-green-300">{score}</span> 点
                    </p>
                    <p className="mt-4 text-yellow-200">{joke}</p>
                  </div>
                )
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;

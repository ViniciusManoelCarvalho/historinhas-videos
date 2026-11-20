import React from "react";
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

// Episódio 1 — "Nesta cidade, as sombras chegam atrasadas" (personagens e história originais)
const W = 1080;
const OUT = "#2d3436";
const GROUND = 1500; // y dos pés
const SIDEWALK_Y = 1380;
const KID_W = 300;
const KID_H = 450;
const SKY = "linear-gradient(#81d4fa, #fff3c4)";

// Posições fixas (sem sobreposição: 30..330, 380..680, 730..1030)
const X_SHADOW = 30;
const X_TEO = 380;
const X_LIA = 730;

type Mood = "happy" | "surprised" | "worried";

const TEO = {hat: "cap", shirt: "#0984e3", pants: "#2d3436", skin: "#ffd7a8"} as const;
const LIA = {hat: "braid", shirt: "#fd79a8", pants: "#6c5ce7", skin: "#e0a370"} as const;

const Caption: React.FC<{text: string; speaker?: string}> = ({text, speaker}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // começa já visível (sem quadro em branco na troca de fala)
  const p = spring({frame: frame + 4, fps, config: {damping: 200}});
  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 60,
        right: 60,
        opacity: p,
        transform: `translateY(${(1 - p) * -30}px)`,
        background: "#ffffff",
        borderRadius: 40,
        border: `6px solid ${OUT}`,
        padding: "30px 40px",
        textAlign: "center",
      }}
    >
      {speaker && <div style={{fontSize: 38, fontWeight: 800, color: "#e17055", marginBottom: 8}}>{speaker}</div>}
      <div style={{fontSize: 56, fontWeight: 800, color: OUT, lineHeight: 1.2}}>{text}</div>
    </div>
  );
};

interface FigureProps {
  x: number;
  walk?: number;
  mood?: Mood;
  hat?: "cap" | "braid" | null;
  shirt?: string;
  pants?: string;
  skin?: string;
  silhouette?: boolean;
  waveDeg?: number;
  talking?: boolean;
}

// Personagem 2D em SVG (viewBox 200x300, pés em y=300)
const Figure: React.FC<FigureProps> = ({
  x,
  walk = 0,
  mood = "happy",
  hat = null,
  shirt = "#0984e3",
  pants = "#2d3436",
  skin = "#ffd7a8",
  silhouette = false,
  waveDeg = 0,
  talking = false,
}) => {
  const f = useCurrentFrame();
  const ws = Math.sin(f / 5) * 28 * walk;
  const bob = walk ? -Math.abs(Math.sin(f / 5)) * 10 : Math.sin(f / 14 + x) * 4; // passo ou respiração
  const sy = (f + Math.round(x / 10)) % 110 < 5 ? 0.1 : 1; // piscada (fora dos cortes)
  const sh = silhouette;
  const SH = "#1e272e";
  const c = (col: string) => (sh ? SH : col);
  const stroke = sh ? "none" : OUT;
  const sw = sh ? 0 : 8;
  const HAIR = "#4e342e";
  const rightArmRot = waveDeg !== 0 ? waveDeg : -ws;
  const mouthOpen = talking && Math.floor(f / 4) % 2 === 0;

  const limb = (x1: number, y1: number, x2: number, y2: number, color: string, width: number) => (
    <>
      {!sh && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={OUT} strokeWidth={width + 8} strokeLinecap="round" />}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c(color)} strokeWidth={width} strokeLinecap="round" />
    </>
  );

  const brows =
    mood === "happy"
      ? ["M 66 58 Q 80 50 94 58", "M 106 58 Q 120 50 134 58"]
      : mood === "surprised"
      ? ["M 66 50 Q 80 40 94 50", "M 106 50 Q 120 40 134 50"]
      : ["M 66 56 Q 80 60 94 50", "M 106 50 Q 120 60 134 56"];

  const mouth = mouthOpen ? (
    <ellipse cx={100} cy={118} rx={14} ry={11} fill="#c0392b" stroke={OUT} strokeWidth={5} />
  ) : mood === "happy" ? (
    <path d="M 78 110 Q 100 136 122 110 Z" fill="#c0392b" stroke={OUT} strokeWidth={5} />
  ) : mood === "surprised" ? (
    <ellipse cx={100} cy={118} rx={10} ry={13} fill="#c0392b" stroke={OUT} strokeWidth={5} />
  ) : (
    <path d="M 84 124 Q 100 112 116 124" fill="none" stroke={OUT} strokeWidth={6} strokeLinecap="round" />
  );

  return (
    <svg
      width={KID_W}
      height={KID_H}
      viewBox="0 0 200 300"
      style={{
        position: "absolute",
        left: x,
        top: GROUND - KID_H + bob,
        overflow: "visible",
        opacity: sh ? 0.82 : 1,
      }}
    >
      {!sh && hat === "braid" && (
        <rect x={148} y={108} width={18} height={124} rx={9} fill={HAIR} stroke={OUT} strokeWidth={6} />
      )}
      {!sh && hat === "braid" && <ellipse cx={100} cy={80} rx={74} ry={72} fill={HAIR} stroke={OUT} strokeWidth={6} />}

      <g transform={`rotate(${-ws} 80 240)`}>
        {limb(80, 240, 76, 296, pants, 30)}
        <ellipse cx={72} cy={302} rx={24} ry={11} fill={c("#2d3436")} stroke={stroke} strokeWidth={sw} />
      </g>
      <g transform={`rotate(${ws} 120 240)`}>
        {limb(120, 240, 124, 296, pants, 30)}
        <ellipse cx={128} cy={302} rx={24} ry={11} fill={c("#2d3436")} stroke={stroke} strokeWidth={sw} />
      </g>

      <rect x={56} y={148} width={88} height={100} rx={34} fill={c(shirt)} stroke={stroke} strokeWidth={sw} />

      <g transform={`rotate(${ws} 62 165)`}>
        {limb(62, 165, 34, 232, shirt, 24)}
        <circle cx={34} cy={240} r={13} fill={c(skin)} stroke={stroke} strokeWidth={sw} />
      </g>
      <g transform={`rotate(${rightArmRot} 138 165)`}>
        {limb(138, 165, 166, 232, shirt, 24)}
        <circle cx={166} cy={240} r={13} fill={c(skin)} stroke={stroke} strokeWidth={sw} />
      </g>

      <circle cx={100} cy={84} r={62} fill={c(skin)} stroke={stroke} strokeWidth={sw} />
      {!sh && hat === "braid" && (
        <path d="M 36 80 Q 52 4 100 18 Q 150 6 164 80 Q 140 46 100 46 Q 62 46 36 80 Z" fill={HAIR} stroke={OUT} strokeWidth={6} />
      )}
      {!sh && hat === "cap" && (
        <>
          <path d="M 36 60 Q 100 -40 164 60 Z" fill="#e17055" stroke={OUT} strokeWidth={8} />
          <path d="M 22 62 Q 100 48 178 62 Q 100 74 22 62 Z" fill="#d35400" stroke={OUT} strokeWidth={6} />
        </>
      )}

      {sh ? (
        // olhos brilhantes da sombra, para ela "ter vida"
        <g transform={`translate(0 84) scale(1 ${sy}) translate(0 -84)`}>
          <ellipse cx={80} cy={84} rx={9} ry={12} fill="#ffffff" />
          <ellipse cx={120} cy={84} rx={9} ry={12} fill="#ffffff" />
        </g>
      ) : (
        <>
          <ellipse cx={62} cy={104} rx={10} ry={7} fill="#ff7675" opacity={0.5} />
          <ellipse cx={138} cy={104} rx={10} ry={7} fill="#ff7675" opacity={0.5} />
          <g transform={`translate(0 84) scale(1 ${sy}) translate(0 -84)`}>
            <ellipse cx={80} cy={84} rx={13} ry={17} fill="#fff" stroke={OUT} strokeWidth={5} />
            <ellipse cx={120} cy={84} rx={13} ry={17} fill="#fff" stroke={OUT} strokeWidth={5} />
            <circle cx={84} cy={88} r={7} fill={OUT} />
            <circle cx={124} cy={88} r={7} fill={OUT} />
          </g>
          <path d={brows[0]} fill="none" stroke={OUT} strokeWidth={6} strokeLinecap="round" />
          <path d={brows[1]} fill="none" stroke={OUT} strokeWidth={6} strokeLinecap="round" />
          {mouth}
        </>
      )}
    </svg>
  );
};

const HOUSE_COLORS = ["#ff7675", "#74b9ff", "#ffeaa7", "#55efc4", "#fab1a0", "#a29bfe", "#fd79a8", "#81ecec", "#fdcb6e", "#e17055"];

const House: React.FC<{x: number; h: number; color: string}> = ({x, h, color}) => {
  const top = SIDEWALK_Y - h;
  const win = (left: number, t: number) => (
    <div style={{position: "absolute", left: x + left, top: top + t, width: 56, height: 56, background: "#ffeaa7", border: `6px solid ${OUT}`, boxSizing: "border-box"}} />
  );
  return (
    <>
      <div style={{position: "absolute", left: x, top, width: 240, height: h, background: color, border: `8px solid ${OUT}`, boxSizing: "border-box", borderRadius: 8}} />
      <div
        style={{
          position: "absolute",
          left: x - 14,
          top: top - 80,
          width: 0,
          height: 0,
          borderLeft: "134px solid transparent",
          borderRight: "134px solid transparent",
          borderBottom: "80px solid #d63031",
        }}
      />
      {win(30, 50)}
      {win(154, 50)}
      {h > 560 && win(30, 170)}
      {h > 560 && win(154, 170)}
      <div
        style={{
          position: "absolute",
          left: x + 92,
          top: SIDEWALK_Y - 100,
          width: 56,
          height: 100,
          background: "#6c5ce7",
          border: `6px solid ${OUT}`,
          boxSizing: "border-box",
          borderRadius: "28px 28px 0 0",
        }}
      />
    </>
  );
};

const Clouds: React.FC = () => {
  const f = useCurrentFrame();
  const cloud = (base: number, y: number, s: number, speed: number, key: number) => {
    const x = ((base + f * speed) % 1500) - 300;
    return (
      <div key={key} style={{position: "absolute", left: x, top: y, width: 260 * s, height: 110 * s}}>
        <div style={{position: "absolute", left: 0, top: 45 * s, width: 260 * s, height: 65 * s, background: "#fff", borderRadius: 40 * s}} />
        <div style={{position: "absolute", left: 40 * s, top: 10 * s, width: 100 * s, height: 100 * s, background: "#fff", borderRadius: "50%"}} />
        <div style={{position: "absolute", left: 115 * s, top: 0, width: 115 * s, height: 110 * s, background: "#fff", borderRadius: "50%"}} />
      </div>
    );
  };
  return <>{[cloud(100, 470, 1, 0.8, 1), cloud(900, 560, 0.7, 0.5, 2), cloud(1350, 420, 0.8, 0.65, 3)]}</>;
};

// Cenário: céu com nuvens, fileira de casas (rola com o scroll), calçada e rua
const Street: React.FC<{scroll: number}> = ({scroll}) => {
  const period = 2600;
  const s = ((scroll % period) + period) % period;
  const houses: React.ReactNode[] = [];
  for (let k = -1; k <= 1; k++) {
    for (let i = 0; i < 10; i++) {
      const x = i * 260 + k * period - s;
      if (x < -280 || x > W + 20) continue;
      const h = 480 + ((i * 97) % 240);
      houses.push(<House key={`${k}-${i}`} x={x} h={h} color={HOUSE_COLORS[i]} />);
    }
  }
  const off = ((scroll % 240) + 240) % 240;
  return (
    <>
      <Clouds />
      {houses}
      <div style={{position: "absolute", left: 0, top: SIDEWALK_Y, width: W, height: 120, background: "#dfe6e9", borderTop: `6px solid ${OUT}`}} />
      <div style={{position: "absolute", left: 0, top: GROUND, width: W, height: 420, background: "#636e72", borderTop: `6px solid ${OUT}`}} />
      {Array.from({length: 7}).map((_, j) => (
        <div key={j} style={{position: "absolute", left: j * 240 - off, top: 1790, width: 120, height: 12, background: "#dfe6e9", borderRadius: 6}} />
      ))}
    </>
  );
};

// Cena 1 (0–3 s): gancho, câmera aproximando
const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  // começa perto e abre até o enquadramento da cena 2 (sem pulo no corte)
  const zoom = interpolate(f, [0, 90], [1.15, 1], {easing: (t) => 1 - Math.pow(1 - t, 2)});
  return (
    <AbsoluteFill style={{background: SKY}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: "50% 80%"}}>
        <Street scroll={0} />
        <Figure x={40} silhouette />
        <Figure {...TEO} x={210} />
      </AbsoluteFill>
      <Caption text="Nesta cidade, as sombras chegam atrasadas..." speaker="Narração" />
    </AbsoluteFill>
  );
};

// Cena 2 (3–11 s): Teo anda e a sombra fica para trás
const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const teoX = interpolate(f, [0, 240], [210, X_TEO], {extrapolateRight: "clamp"});
  const lag = interpolate(f, [0, 240], [0, 420], {extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{background: SKY}}>
      <Street scroll={f * 5} />
      <Figure x={teoX - 170 - lag} silhouette walk={1} />
      <Figure {...TEO} x={teoX} walk={1} mood={f < 140 ? "happy" : "worried"} talking={f < 40 || (f >= 140 && f < 180)} />
      <Sequence from={0} durationInFrames={140}>
        <Caption text="Tô andando tranquilo..." speaker="Teo" />
      </Sequence>
      <Sequence from={140} durationInFrames={100}>
        <Caption text="Ué... cadê minha sombra?" speaker="Teo" />
      </Sequence>
    </AbsoluteFill>
  );
};

// Cena 3 (11–18 s): a sombra chega correndo e para ao lado; a Lia aparece
const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const shadowX = interpolate(f, [0, 110], [-200, X_SHADOW], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const liaX = interpolate(f, [20, 125], [1150, X_LIA], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{background: SKY}}>
      <Street scroll={1200} />
      <Figure x={shadowX} silhouette walk={f < 110 ? 1.4 : 0} />
      <Figure {...TEO} x={X_TEO} mood={f < 110 ? "surprised" : "happy"} talking={f < 30 || (f >= 60 && f < 100)} />
      <Figure {...LIA} x={liaX} walk={f >= 20 && f < 125 ? 1 : 0} talking={f >= 130 && f < 180} />
      <Sequence from={0} durationInFrames={60}>
        <Caption text="Olha lá! Ela tá vindo..." speaker="Teo" />
      </Sequence>
      <Sequence from={60} durationInFrames={70}>
        <Caption text="Ah, achei! Chegou atrasada..." speaker="Teo" />
      </Sequence>
      <Sequence from={130} durationInFrames={80}>
        <Caption text="Relaxa, aqui a sombra sempre chega depois." speaker="Lia" />
      </Sequence>
    </AbsoluteFill>
  );
};

// Cena 4 (18–26 s): andam juntos; a sombra para e acena sozinha
const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const walking = f < 140;
  const scroll = 1200 + Math.min(f, 140) * 5;
  const waveDeg = f < 150 ? 0 : f < 170 ? interpolate(f, [150, 170], [0, -150]) : -150 + Math.sin(f / 4) * 18;
  return (
    <AbsoluteFill style={{background: SKY}}>
      <Street scroll={scroll} />
      <Figure x={X_SHADOW} silhouette walk={walking ? 1 : 0} waveDeg={waveDeg} />
      <Figure {...TEO} x={X_TEO} walk={walking ? 1 : 0} mood={f >= 150 ? "surprised" : "happy"} talking={(f >= 90 && f < 130) || (f >= 150 && f < 190)} />
      <Figure {...LIA} x={X_LIA} walk={walking ? 1 : 0} mood={f >= 150 ? "surprised" : "happy"} talking={f < 50} />
      <Sequence from={0} durationInFrames={90}>
        <Caption text="Vamos pro parque? Tem um relógio sem ponteiros lá." speaker="Lia" />
      </Sequence>
      <Sequence from={90} durationInFrames={60}>
        <Caption text="Relógio sem ponteiros? Que estranho..." speaker="Teo" />
      </Sequence>
      <Sequence from={150} durationInFrames={90}>
        <Caption text="Ei! Eu não tô acenando!" speaker="Teo" />
      </Sequence>
    </AbsoluteFill>
  );
};

// Cena 5 (26–30 s): cartão final no topo, sombra acenando à vista
const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f + 4, fps, config: {damping: 14}});
  const waveDeg = -150 + Math.sin((f + 240) / 4) * 18;
  return (
    <AbsoluteFill style={{background: SKY}}>
      <Street scroll={1900} />
      <Figure x={X_SHADOW} silhouette waveDeg={waveDeg} />
      <Figure {...TEO} x={X_TEO} mood="surprised" />
      <Figure {...LIA} x={X_LIA} mood="surprised" />
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 60,
          right: 60,
          transform: `scale(${0.8 + 0.2 * p})`,
          opacity: Math.min(1, p * 1.5),
          textAlign: "center",
          background: "#ffffff",
          border: `6px solid ${OUT}`,
          borderRadius: 40,
          padding: "30px 40px",
        }}
      >
        <div style={{fontSize: 52, fontWeight: 800, color: OUT}}>Nesta cidade, as sombras chegam atrasadas</div>
        <div style={{fontSize: 104, fontWeight: 900, color: "#e17055", marginTop: 10}}>Parte 2 amanhã!</div>
      </div>
    </AbsoluteFill>
  );
};

export const Episodio1: React.FC = () => (
  <AbsoluteFill style={{fontFamily: '"Nimbus Sans", Arial, sans-serif', background: "#000"}}>
    <Sequence from={0} durationInFrames={90}>
      <Scene1 />
    </Sequence>
    <Sequence from={90} durationInFrames={240}>
      <Scene2 />
    </Sequence>
    <Sequence from={330} durationInFrames={210}>
      <Scene3 />
    </Sequence>
    <Sequence from={540} durationInFrames={240}>
      <Scene4 />
    </Sequence>
    <Sequence from={780} durationInFrames={120}>
      <Scene5 />
    </Sequence>
  </AbsoluteFill>
);

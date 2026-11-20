import React from "react";
import {Composition} from "remotion";
import {Episodio1} from "./Episodio1";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Episodio1"
      component={Episodio1}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);

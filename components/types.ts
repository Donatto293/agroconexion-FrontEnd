// biome-ignore lint/complexity/noBannedTypes: <explanation>
import type { StyleProp, ViewStyle } from "react-native";
import type { PanGesture } from "react-native-gesture-handler";
import type { SharedValue, WithSpringConfig, WithTimingConfig } from "react-native-reanimated";
import type Animated from "react-native-reanimated";

export type IComputedDirectionTypes<T, VP = {}, HP = {}> =
  | (T &
      VP & {
        /**
         * Layout items vertically instead of horizontally
         */
        vertical: true;
        /**
         * Layout items vertically instead of horizontally
         */
        /**
         * Specified carousel container width.
         */
        width?: number;
        height: number;
      })
  | (T &
      HP & {
        /**
         * Layout items vertically instead of horizontally
         */
        vertical?: false;
        /**
         * Layout items vertically instead of horizontally
         */
        /**
         * Specified carousel container width.
         */
        width: number;
        height?: number;
      });

export interface CustomConfig {
  type?: "negative" | "positive";
  viewCount?: number;
}

export interface WithSpringAnimation {
  type: "spring";
  config: WithSpringConfig;
}

export interface WithTimingAnimation {
  type: "timing";
  config: WithTimingConfig;
}

export type WithAnimation = WithSpringAnimation | WithTimingAnimation;
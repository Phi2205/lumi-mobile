import React, { createContext, useContext } from "react";
import { View } from "react-native";

const BlurTargetContext = createContext<React.RefObject<View | null> | null>(null);

export const BlurTargetProvider = BlurTargetContext.Provider;

export function useBlurTarget() {
  return useContext(BlurTargetContext);
}

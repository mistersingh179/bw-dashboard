import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";

(async () => {
  const content = '\n            \n              0 seconds of 2 minutes, 4 secondsVolume 90%Press shift question mark to access a list of keyboard shortcutsKeyboard ShortcutsEnabledDisabledPlay/PauseSPACEIncrease Volume↑Decrease Volume↓Seek Forward→Seek Backward←Captions On/OffcFullscreen/Exit FullscreenfMute/UnmutemSeek %0-9SettingsOffEnglishFont ColorWhiteFont Opacity100%Font Size100%Font FamilyArialCharacter EdgeNoneBackground ColorBlackBackground Opacity50%Window ColorBlackWindow Opacity0%ResetWhiteBlackRedGreenBlueYellowMagentaCyan100%75%50%25%200%175%150%125%100%75%50%ArialCourierGeorgiaImpactLucida ConsoleTahomaTimes New RomanTrebuchet MSVerdanaNoneRaisedDepressedUniformDrop ShadowWhiteBlackRedGreenBlueYellowMagentaCyan100%75%50%25%0%WhiteBlackRedGreenBlueYellowMagentaCyan100%75%50%25%0%Auto1080p720p406p270p180p\n            \n                \n                    \n                    \n                    \n                \n            \n        Live00:0000:0002:04 \n              \n                \n                  2:04\n              \n            \n            \n              Watch How to Make Homemade Pizza\n            \n              \n            \n          '
  const output = stripHtml(content);
  console.log(output.result);
})();

export {};

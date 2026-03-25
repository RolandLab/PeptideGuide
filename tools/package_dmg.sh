#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
APP_NAME="PeptideGuideApp"
DISPLAY_NAME="Peptide Guide"
VOLUME_NAME="Peptide Guide"
RELEASE_NAME="PeptideGuideApp"
RW_DMG="$DIST_DIR/${APP_NAME}-temp.dmg"
FINAL_DMG="$DIST_DIR/${RELEASE_NAME}.dmg"
DMG_WORK_DIR="$(mktemp -d /private/tmp/peptide-dmg.XXXXXX)"
DMG_ROOT="$DMG_WORK_DIR/dmg-root"
BACKGROUND_DIR="$DMG_WORK_DIR/dmg-assets"
BACKGROUND_FILE="$BACKGROUND_DIR/background.png"
APP_SOURCE="${APP_SOURCE:-$HOME/Applications/$APP_NAME.app}"

cleanup() {
  rm -rf "$DMG_WORK_DIR"
}

trap cleanup EXIT

if [[ ! -d "$APP_SOURCE" ]]; then
  echo "App source not found: $APP_SOURCE" >&2
  exit 1
fi

swift "$ROOT_DIR/tools/generate_dmg_background.swift" "$BACKGROUND_FILE"

rm -f "$FINAL_DMG" "$DIST_DIR/${APP_NAME}.dmg" "$RW_DMG"
mkdir -p "$DMG_ROOT/.background"

ditto "$APP_SOURCE" "$DMG_ROOT/$APP_NAME.app"
xattr -cr "$DMG_ROOT/$APP_NAME.app"
cp "$BACKGROUND_FILE" "$DMG_ROOT/.background/background.png"
ln -sfn /Applications "$DMG_ROOT/Applications"
xattr -cr "$DMG_ROOT"

hdiutil create -srcfolder "$DMG_ROOT" -volname "$VOLUME_NAME" -fs HFS+ -fsargs "-c c=64,a=16,e=16" -format UDRW "$RW_DMG"

ATTACH_OUTPUT="$(hdiutil attach -readwrite -noverify -noautoopen "$RW_DMG")"
DEVICE="$(echo "$ATTACH_OUTPUT" | awk '/Apple_HFS/ {print $1}')"
MOUNT_POINT="$(echo "$ATTACH_OUTPUT" | awk -F'\t' '/Apple_HFS/ {print $3}')"

osascript <<OSA
tell application "Finder"
  tell disk "$VOLUME_NAME"
    open
    delay 1
    set current view of container window to icon view
    set toolbar visible of container window to false
    set statusbar visible of container window to false
    set bounds of container window to {120, 120, 1080, 720}
    set viewOptions to the icon view options of container window
    set arrangement of viewOptions to not arranged
    set icon size of viewOptions to 144
    set text size of viewOptions to 15
    set background picture of viewOptions to file ".background:background.png"
    set appItemName to "$DISPLAY_NAME"
    if not (exists item appItemName of container window) then
      set appItemName to "$APP_NAME.app"
    end if
    set position of item appItemName of container window to {250, 320}
    set position of item "Applications" of container window to {710, 320}
    close
    open
    update without registering applications
    delay 2
  end tell
end tell
OSA

hdiutil detach "$DEVICE"
hdiutil convert "$RW_DMG" -format UDZO -imagekey zlib-level=9 -o "$FINAL_DMG"
rm -f "$RW_DMG"

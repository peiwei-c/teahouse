import React from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  isFree,
  layoutExtent,
  remaining,
  remainingCount,
  specFor,
  MAX_LEVEL,
} from '../engine/table';
import { useGameStore, selectCanUndo, selectHintLabel } from '../store/gameStore';
import { IMAGES } from '../theme/images';
import { TOP_BUFFER } from '../theme/androidTopInset';
import { FONTS, TEA } from '../theme/tea';
import { shouldShowInterstitial } from '../ads/cadence';
import { showInterstitial } from '../ads/interstitial';
import { playTileSfx } from '../audio/session';
import { ClearPopup } from './ClearPopup';
import { CreamButton, TeaScene } from './TeaScene';
import { Tile, tileDepthFor } from './Tile';
import { UiText } from './UiText';

const FACE_RATIO = 1.08;

function boardMetrics(
  width: number,
  height: number,
  large: boolean,
  cols: number,
  rows: number,
  maxLayer: number,
) {
  const rise = Math.max(0, maxLayer - 1);
  const usableW = Math.max(72, width);
  const usableH = Math.max(72, height);
  const depthRatio = 0.08;
  const padExtra = 6;

  const measure = (faceW: number) => {
    const faceH = Math.round(faceW * FACE_RATIO);
    const depth = tileDepthFor(faceW);
    const stack = depth * rise;
    const pad = depth + padExtra;
    const extra = stack + depth;
    const gridW = pad * 2 + faceW * cols;
    const gridH = pad * 2 + faceH * rows;
    return {
      tileW: faceW,
      tileH: faceH,
      depth,
      pad,
      pitchX: faceW,
      pitchY: faceH,
      gridW,
      extra,
      boardW: gridW + extra,
      boardH: gridH + extra,
    };
  };

  const colUnits = Math.max(cols, 1) + depthRatio * (rise + 3) * 2;
  const rowUnits = Math.max(rows, 1) * FACE_RATIO + depthRatio * (rise + 3);
  const cap = large ? 72 : 56;
  let faceW = Math.max(
    10,
    Math.min(
      cap,
      Math.floor((usableW - padExtra * 2) / colUnits),
      Math.floor((usableH - padExtra * 2) / rowUnits),
    ),
  );
  let metrics = measure(faceW);
  while (
    faceW > 10 &&
    (metrics.gridW + metrics.extra * 2 > usableW || metrics.boardH > usableH)
  ) {
    faceW -= 1;
    metrics = measure(faceW);
  }
  return metrics;
}

export function PlayScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [felt, setFelt] = React.useState({
    width: Math.min(windowWidth, 430),
    height: Math.max(280, Math.floor(windowHeight * 0.52)),
  });
  const table = useGameStore((s) => s.table);
  const showMatches = useGameStore((s) => s.settings.showMatches);
  const largeTiles = useGameStore((s) => s.settings.largeTiles);
  const goHome = useGameStore((s) => s.goHome);
  const tapTile = useGameStore((s) => s.tapTile);
  const hint = useGameStore((s) => s.hint);
  const undo = useGameStore((s) => s.undo);
  const nextTable = useGameStore((s) => s.nextTable);
  const level = useGameStore((s) => s.settings.level);
  const clearMs = useGameStore((s) => s.clearMs);
  const canUndo = useGameStore(selectCanUndo);
  const hintText = useGameStore(selectHintLabel);
  const advancing = React.useRef(false);

  const onNext = React.useCallback(async () => {
    if (advancing.current) return;
    advancing.current = true;
    try {
      if (shouldShowInterstitial(level)) {
        await showInterstitial();
      }
      nextTable();
    } finally {
      advancing.current = false;
    }
  }, [level, nextTable]);

  const left = remainingCount(table);
  const spec = specFor(level);
  const live = remaining(table);
  const extent = layoutExtent(table.tiles);
  const maxLayer = live.reduce((max, tile) => Math.max(max, tile.layer), 1);
  const metrics = boardMetrics(felt.width, felt.height, largeTiles, extent.cols, extent.rows, maxLayer);
  const won = left === 0;
  const nextLabel = level >= MAX_LEVEL ? 'Home' : 'Next';

  return (
    <TeaScene>
      <View style={styles.root}>
        <View style={styles.hud}>
          <CreamButton onPress={goHome} accessibilityLabel="Home" style={styles.homeBtn}>
            <UiText fit style={styles.hudText}>
              Home
            </UiText>
          </CreamButton>
          <View style={styles.chip}>
            <UiText fit style={styles.chipCount}>
              {left}
            </UiText>
            <UiText fit style={styles.chipLabel}>
              Level {spec.level} · {spec.layers === 1 ? '1 layer' : `${spec.layers} layers`}
            </UiText>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.stage}>
          <View
            style={styles.boardSlot}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setFelt((prev) =>
                prev.width === width && prev.height === height ? prev : { width, height },
              );
            }}
          >
          <View
            style={[
              styles.board,
              {
                width: metrics.boardW,
                height: metrics.boardH,
                transform: [{ translateX: Math.round(metrics.extra / 2) }],
              },
            ]}
          >
            {live.map((tile) => {
              const free = isFree(table, tile);
              const lift = (tile.layer - 1) * metrics.depth;
              return (
                <View
                  key={tile.id}
                  style={{
                    position: 'absolute',
                    left: metrics.pad + tile.col * metrics.pitchX + lift,
                    top: metrics.pad + tile.row * metrics.pitchY + lift,
                    zIndex:
                      tile.layer * 30 +
                      tile.row * 2 +
                      tile.col +
                      (table.pointed.includes(tile.id) ? 400 : 0),
                  }}
                >
                  <Tile
                    face={tile.face}
                    width={metrics.tileW}
                    height={metrics.tileH}
                    depth={metrics.depth}
                    layer={tile.layer}
                    free={showMatches && free}
                    picked={table.picked === tile.id}
                    pointed={table.pointed.includes(tile.id)}
                    onPress={() => {
                      playTileSfx(free);
                      tapTile(tile.id);
                    }}
                  />
                </View>
              );
            })}
          </View>
          </View>

          <View style={styles.buddy}>
            <View style={styles.bubble}>
              <UiText numberOfLines={3} style={styles.bubbleText}>
                {table.buddyLine}
              </UiText>
            </View>
            <Image source={IMAGES.companion} style={styles.cat} resizeMode="cover" />
          </View>
        </View>

        <View style={styles.dock}>
          <CreamButton
            onPress={undo}
            disabled={won || !canUndo}
            accessibilityLabel="Undo"
            style={styles.dockBtn}
          >
            <UiText fit style={[styles.dockText, (won || !canUndo) && styles.disabled]}>
              Undo
            </UiText>
          </CreamButton>
          <CreamButton onPress={hint} accessibilityLabel={hintText} disabled={won} style={styles.dockBtn}>
            <UiText fit style={[styles.dockText, won && styles.disabled]}>
              {hintText}
            </UiText>
          </CreamButton>
        </View>

          <ClearPopup
            visible={won}
            clearMs={clearMs ?? 0}
            nextLabel={nextLabel}
            onNext={onNext}
          />
        </View>
      </View>
    </TeaScene>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 10 + TOP_BUFFER,
    paddingBottom: 8,
    position: 'relative',
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  homeBtn: {
    flexGrow: 0,
    flexShrink: 0,
  },
  hudText: {
    fontFamily: FONTS.ui,
    fontSize: 18,
    lineHeight: 22,
    color: TEA.ink,
  },
  disabled: {
    opacity: 0.4,
  },
  chip: {
    flex: 1,
    minHeight: 54,
    minWidth: 0,
    borderRadius: 16,
    backgroundColor: TEA.creamBtn,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    shadowColor: '#5a3418',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  chipCount: {
    fontFamily: FONTS.display,
    fontSize: 22,
    color: TEA.ink,
  },
  chipLabel: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    color: TEA.inkSoft,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  stage: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  boardSlot: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  board: {
    position: 'relative',
    overflow: 'visible',
  },
  buddy: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    width: '100%',
    maxWidth: 420,
  },
  bubble: {
    flex: 1,
    backgroundColor: TEA.ivory,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: TEA.gold,
  },
  bubbleText: {
    fontFamily: FONTS.ui,
    fontSize: 16,
    color: TEA.ink,
  },
  cat: {
    width: 88,
    height: 88,
    borderRadius: 16,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    gap: 10,
    marginHorizontal: 8,
    marginTop: 8,
    padding: 10,
    borderRadius: 18,
    backgroundColor: TEA.wood,
  },
  dockBtn: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    minHeight: 68,
  },
  dockText: {
    fontFamily: FONTS.ui,
    fontSize: 22,
    lineHeight: 26,
    color: TEA.ink,
    textAlign: 'center',
  },
});

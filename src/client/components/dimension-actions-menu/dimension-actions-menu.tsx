/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { classNames } from "../../utils/dom/dom";
import { BubbleMenu, Direction } from "../bubble-menu/bubble-menu";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./dimension-actions-menu.scss";

const ACTION_SIZE = 58;

export interface DimensionActionsMenuProps {
  openOn: Element;
  direction: Direction;
  containerStage: Stage;
}

export interface DimensionActionsProps {
  clicker: Clicker;
  essence: Essence;
  dimension: Dimension;
  onClose: Fn;
  triggerFilterMenu: (dimension: Dimension) => void;
}

export const DimensionActionsMenu: React.SFC<DimensionActionsProps & DimensionActionsMenuProps> =
  (props: DimensionActionsMenuProps & DimensionActionsProps) => {
    const { triggerFilterMenu, clicker, essence, direction, containerStage, openOn, dimension, onClose } = props;
    return <BubbleMenu
      className="dimension-actions-menu"
      direction={direction}
      containerStage={containerStage}
      stage={Stage.fromSize(ACTION_SIZE * 2, ACTION_SIZE * 2)}
      fixedSize={true}
      openOn={openOn}
      onClose={onClose}
    >
      <DimensionActions
        essence={essence}
        clicker={clicker}
        dimension={dimension}
        onClose={onClose}
        triggerFilterMenu={triggerFilterMenu} />
    </BubbleMenu>;
  };

export const DimensionActions: React.SFC<DimensionActionsProps> = (props: DimensionActionsProps) => {
  const { onClose, triggerFilterMenu, clicker, essence: { splits }, dimension } = props;
  if (!dimension) return null;

  const hasSplitOn = splits.hasSplitOn(dimension);
  const isOnlySplit = splits.length() === 1 && hasSplitOn;

  function onFilter() {
    triggerFilterMenu(dimension);
    onClose();
  }

  function onSplit() {
    if (!isOnlySplit) clicker.changeSplit(Split.fromDimension(dimension), VisStrategy.FairGame);
    onClose();
  }

  function onSubSplit() {
    if (!hasSplitOn) clicker.addSplit(Split.fromDimension(dimension), VisStrategy.FairGame);
    onClose();
  }

  function onPin() {
    clicker.pin(dimension);
    onClose();
  }

  return <React.Fragment>
    <div className={classNames("filter", "action")} onClick={onFilter}>
      <SvgIcon svg={require("../../icons/preview-filter.svg")} />
      <div className="action-label">{STRINGS.filter}</div>
    </div>
    <div className="pin action" onClick={onPin}>
      <SvgIcon svg={require("../../icons/preview-pin.svg")} />
      <div className="action-label">{STRINGS.pin}</div>
    </div>
    <div className={classNames("split", "action", { disabled: isOnlySplit })} onClick={onSplit}>
      <SvgIcon svg={require("../../icons/preview-split.svg")} />
      <div className="action-label">{STRINGS.split}</div>
    </div>
    <div className={classNames("subsplit", "action", { disabled: hasSplitOn })} onClick={onSubSplit}>
      <SvgIcon svg={require("../../icons/preview-subsplit.svg")} />
      <div className="action-label">{STRINGS.subsplit}</div>
    </div>
  </React.Fragment>;
};

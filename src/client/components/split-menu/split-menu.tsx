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

import { Duration } from "chronoshift";
import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Colors } from "../../../common/models/colors/colors";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { granularityToString, isGranularityValid } from "../../../common/models/granularity/granularity";
import { Sort } from "../../../common/models/sort/sort";
import { Bucket, Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { enterKey } from "../../utils/dom/dom";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { Button } from "../button/button";
import { GranularityPicker } from "./granularity-picker";
import { LimitDropdown } from "./limit-dropdown";
import { SortDropdown } from "./sort-dropdown";
import "./split-menu.scss";

export interface SplitMenuProps {
  clicker: Clicker;
  essence: Essence;
  openOn: Element;
  containerStage: Stage;
  onClose: Fn;
  dimension: Dimension;
  split: Split;
  inside?: Element;
}

export interface SplitMenuState {
  reference?: string;
  granularity?: string;
  sort?: Sort;
  limit?: number;
  colors?: Colors;
}

export class SplitMenu extends React.Component<SplitMenuProps, SplitMenuState> {
  public mounted: boolean;

  state: SplitMenuState = {};

  componentWillMount() {
    const { essence, split } = this.props;
    const { colors } = essence;
    const { bucket, reference, sort, limit } = split;

    const colorsDimensionMatch = colors && colors.dimension === split.reference;

    this.setState({
      reference,
      sort,
      limit,
      granularity: bucket && granularityToString(bucket),
      colors: colorsDimensionMatch ? colors : null
    });
  }

  componentDidMount() {
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalKeyDownListener = (e: KeyboardEvent) => enterKey(e) && this.onOkClick();

  saveGranularity = (granularity: string) => this.setState({ granularity });

  saveSort = (sort: Sort) => this.setState({ sort });

  saveLimit = (limit: number, colors: Colors) => this.setState({ colors, limit });

  onCancelClick = () => this.props.onClose();

  onOkClick = () => {
    if (!this.validate()) return;
    const { split: originalSplit, clicker, essence, onClose } = this.props;
    const split = this.constructSplitCombine();
    clicker.changeSplits(essence.splits.replace(originalSplit, split), VisStrategy.UnfairGame, this.state.colors);
    onClose();
  }

  private constructGranularity(): Bucket {
    const { dimension: { kind } } = this.props;
    const { granularity } = this.state;
    if (kind === "time") {
      return Duration.fromJS(granularity);
    }
    if (kind === "number") {
      return parseInt(granularity, 10);
    }
    return null;
  }

  private constructSplitCombine(): Split {
    const { split: { type } } = this.props;
    const { limit, sort, reference } = this.state;
    const bucket = this.constructGranularity();
    return new Split({ type, reference, limit, sort, bucket });
  }

  validate() {
    const { dimension: { kind }, split: originalSplit, essence: { colors: originalColors } } = this.props;
    if (!isGranularityValid(kind, this.state.granularity)) {
      return false;
    }
    const newSplit: Split = this.constructSplitCombine();
    return !originalSplit.equals(newSplit)
      || (originalColors && !originalColors.equals(this.state.colors));
  }

  render() {
    const { essence: { dataCube }, containerStage, openOn, dimension, onClose, inside } = this.props;
    const { colors, sort, granularity, limit } = this.state;
    if (!dimension) return null;

    return <BubbleMenu
      className="split-menu"
      direction="down"
      containerStage={containerStage}
      stage={Stage.fromSize(250, 240)}
      openOn={openOn}
      onClose={onClose}
      inside={inside}
    >
      <GranularityPicker
        dimension={dimension}
        granularityChange={this.saveGranularity}
        granularity={granularity}
      />
      <SortDropdown
        sort={sort}
        dataCube={dataCube}
        dimension={dimension}
        onChange={this.saveSort}
      />
      <LimitDropdown
        colors={colors}
        onLimitSelect={this.saveLimit}
        limit={limit}
        includeNone={dimension.isContinuous()}/>
      <div className="button-bar">
        <Button className="ok" type="primary" disabled={!this.validate()} onClick={this.onOkClick} title={STRINGS.ok} />
        <Button type="secondary" onClick={this.onCancelClick} title={STRINGS.cancel} />
      </div>
    </BubbleMenu>;
  }
}

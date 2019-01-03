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

import { Manifest, Resolve } from "../../models/manifest/manifest";
import { Sort } from "../../models/sort/sort";
import { Actions } from "../../utils/rules/actions";
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";
import { SortDirection } from "../../view-definitions/version-4/split-definition";

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.noSplits())
  .then(Actions.manualDimensionSelection("The Table requires at least one split"))
  .when(Predicates.supportedSplitsCount())
  .then(Actions.removeExcessiveSplits("Table"))

  .otherwise(({ splits, dataCube, colors, isSelectedVisualization }) => {
    let autoChanged = false;
    const newSplits = splits.update("splits", splits => splits.map((split, i) => {
      const splitDimension = dataCube.getDimension(splits.first().reference);
      const sortStrategy = splitDimension.sortStrategy;

      if (split.sort.empty()) {
        if (sortStrategy) {
          if (sortStrategy === "self") {
            split = split.changeSort(new Sort({
              reference: splitDimension.name,
              direction: SortDirection.descending
            }));
          } else {
            split = split.changeSort(new Sort({
              reference: sortStrategy,
              direction: SortDirection.descending
            }));
          }
        } else {
          split = split.changeSort(dataCube.getDefaultSortExpression());
          autoChanged = true;
        }
      }

      // ToDo: review this
      if (!split.limit && (autoChanged || splitDimension.kind !== "time")) {
        split = split.changeLimit(i ? 5 : 50);
        autoChanged = true;
      }

      return split;
    }));

    if (colors) {
      colors = null;
      autoChanged = true;
    }

    return autoChanged ? Resolve.automatic(6, { splits: newSplits }) : Resolve.ready(isSelectedVisualization ? 10 : 8);
  })
  .build();

export const TABLE_MANIFEST = new Manifest(
  "table",
  "Table",
  rulesEvaluator
);

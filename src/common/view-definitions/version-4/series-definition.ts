/*
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

import { SeriesList } from "../../models/series-list/series-list";

export interface SeriesDefinition {
  reference: string;
}

type SeriesDefinitionsList = SeriesDefinition[];

export interface SeriesDefinitionConverter {
  fromEssenceSeries(series: SeriesList): SeriesDefinitionsList;

  toEssenceSeries(seriesDefs: SeriesDefinitionsList): SeriesList;
}

export const seriesDefinitionConverter: SeriesDefinitionConverter = {
  fromEssenceSeries: (seriesList: SeriesList) =>
    seriesList.series.toArray().map(series => series.toJS()),
  toEssenceSeries: (seriesDefs: SeriesDefinitionsList) =>
    SeriesList.fromJS(seriesDefs)
};

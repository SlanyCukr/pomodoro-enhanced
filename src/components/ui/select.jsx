'use client';

import * as React from 'react';
import { createStyleContext } from '@chakra-ui/react';
import * as SelectPrimitive from '@ark-ui/react/select';
import { createStyleContext } from '@chakra-ui/react';
import { styled } from '@/styled-system/jsx';
import { select } from '@/styled-system/recipes';

const { withProvider, withContext } = createStyleContext(select);

export const SelectRoot = withProvider(SelectPrimitive.Root, 'root');
export const SelectClearTrigger = withContext(SelectPrimitive.ClearTrigger, 'clearTrigger');
export const SelectContent = withContext(SelectPrimitive.Content, 'content');
export const SelectControl = withContext(SelectPrimitive.Control, 'control');
export const SelectIndicator = withContext(SelectPrimitive.Indicator, 'indicator');
export const SelectItem = withContext(SelectPrimitive.Item, 'item');
export const SelectItemGroup = withContext(SelectPrimitive.ItemGroup, 'itemGroup');
export const SelectItemGroupLabel = withContext(SelectPrimitive.ItemGroupLabel, 'itemGroupLabel');
export const SelectItemIndicator = withContext(SelectPrimitive.ItemIndicator, 'itemIndicator');
export const SelectItemText = withContext(SelectPrimitive.ItemText, 'itemText');
export const SelectLabel = withContext(SelectPrimitive.Label, 'label');
export const SelectPositioner = withContext(SelectPrimitive.Positioner, 'positioner');
export const SelectTrigger = withContext(SelectPrimitive.Trigger, 'trigger');
export const SelectValueText = withContext(SelectPrimitive.ValueText, 'valueText');

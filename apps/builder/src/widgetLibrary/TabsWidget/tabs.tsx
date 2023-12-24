import { FC, useCallback, useEffect, useMemo } from "react"
import { TabPane, Tabs } from "@illa-design/react"
import { AutoHeightContainer } from "@/widgetLibrary/PublicSector/AutoHeightContainer"
import { TooltipWrapper } from "@/widgetLibrary/PublicSector/TooltipWrapper"
import { TabsWidgetProps, WrappedTabsProps } from "./interface"
import { fullWidthAndFullHeightStyle } from "./style"

export const WrappedTabs: FC<WrappedTabsProps> = (props) => {
  const {
    align,
    activeKey,
    disabled,
    tabList = [],
    colorScheme,
    tabPosition,
    handleOnChange,
    handleUpdateExecution,
  } = props

  return (
    <Tabs
      w={"100%"}
      align={align}
      colorScheme={colorScheme}
      tabPosition={tabPosition}
      activeKey={activeKey}
      onChange={(value) => {
        new Promise((resolve) => {
          const currentIndex = tabList?.findIndex((view) => view.key === value)
          handleUpdateExecution?.({
            currentKey: value,
            currentIndex,
          })
          resolve(true)
        }).then(() => {
          handleOnChange?.()
        })
      }}
    >
      {Array.isArray(tabList) &&
        tabList?.map((item) => {
          if (item.hidden) return null
          return (
            <TabPane
              key={item.key}
              title={item.label}
              disabled={disabled || item.disabled}
            />
          )
        })}
    </Tabs>
  )
}

WrappedTabs.displayName = "WrappedTabs"

export const TabsWidget: FC<TabsWidgetProps> = (props) => {
  const {
    value,
    align,
    disabled,
    navigateContainer,
    currentKey,
    tabList = [],
    viewList,
    displayName,
    linkWidgetDisplayName,
    handleUpdateDsl,
    updateComponentRuntimeProps,
    deleteComponentRuntimeProps,
    tooltipText,
    colorScheme,
    tabPosition,
    triggerEventHandler,
    updateComponentHeight,
    handleUpdateMultiExecutionResult,
  } = props

  useEffect(() => {
    updateComponentRuntimeProps({
      setValue: (value: string) => {
        handleUpdateDsl({ value })
      },
      clearValue: () => {
        handleUpdateDsl({ value: undefined })
      },
    })

    return () => {
      deleteComponentRuntimeProps()
    }
  }, [
    displayName,
    value,
    updateComponentRuntimeProps,
    handleUpdateDsl,
    deleteComponentRuntimeProps,
  ])

  const list = useMemo(() => {
    if (navigateContainer) return viewList
    return tabList
  }, [navigateContainer, tabList, viewList])

  const handleUpdateExecution = useCallback(
    (updateSliceItem: Record<string, any>) => {
      if (navigateContainer && linkWidgetDisplayName) {
        handleUpdateMultiExecutionResult([
          {
            displayName: linkWidgetDisplayName,
            value: updateSliceItem,
          },
        ])
      }
      handleUpdateMultiExecutionResult([
        {
          displayName,
          value: updateSliceItem,
        },
      ])
    },
    [
      displayName,
      handleUpdateMultiExecutionResult,
      linkWidgetDisplayName,
      navigateContainer,
    ],
  )

  const handleOnChange = useCallback(() => {
    triggerEventHandler("change")
  }, [triggerEventHandler])

  return (
    <AutoHeightContainer updateComponentHeight={updateComponentHeight}>
      <TooltipWrapper tooltipText={tooltipText} tooltipDisabled={!tooltipText}>
        <div css={fullWidthAndFullHeightStyle}>
          <WrappedTabs
            {...props}
            tabList={list}
            value={value}
            align={align}
            activeKey={currentKey}
            colorScheme={colorScheme}
            tabPosition={tabPosition}
            disabled={disabled}
            linkWidgetDisplayName={linkWidgetDisplayName}
            handleUpdateExecution={handleUpdateExecution}
            handleOnChange={handleOnChange}
          />
        </div>
      </TooltipWrapper>
    </AutoHeightContainer>
  )
}

TabsWidget.displayName = "TabsWidget"
export default TabsWidget

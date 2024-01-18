import {
  ILLA_MIXPANEL_EVENT_TYPE,
  MixpanelTrackContext,
} from "@illa-public/mixpanel-utils"
import { FC, useContext, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { getAIAgentIDMapAgent } from "@/redux/aiAgent/dashboardTeamAIAgentSelector"
import {
  getActionIDMapAction,
  getTutorialLinkMapActions,
} from "@/redux/currentApp/action/actionSelector"
import { actionActions } from "@/redux/currentApp/action/actionSlice"
import { getResourceIDMapResource } from "@/redux/resource/resourceSelector"
import { fetchBatchUpdateAction } from "@/services/action"
import store from "@/store"
import { MissingResourceFooter } from "../Footer"
import { MissingListProps } from "./interface"
import { ListItem } from "./listItem"
import {
  cellStyle,
  columnContainerStyle,
  missingListContainerStyle,
} from "./style"

const MissingList: FC<MissingListProps> = (props) => {
  const { handleCancelModal } = props
  const missingResourceActionList = useSelector(getTutorialLinkMapActions)
  const actionIDMapAction = useSelector(getActionIDMapAction)
  const { track } = useContext(MixpanelTrackContext)

  const [isSaving, setIsSaving] = useState(false)
  const [replaceInfo, setReplaceInfo] = useState(
    new Map<
      string,
      {
        resourceID: string
        actionIDs: string[]
      }
    >(),
  )
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const handleChangePlaceInfo = (
    index: string,
    resourceID: string,
    actionIDs: string[],
  ) => {
    setReplaceInfo((prevInfo) => {
      const newReplaceInfo = new Map(prevInfo)
      newReplaceInfo.set(index, {
        resourceID,
        actionIDs,
      })
      return newReplaceInfo
    })
  }
  const replaceInfoList = Array.from(replaceInfo.values())

  const handleConfirmModal = async () => {
    if (replaceInfoList.length === 0) return
    const resourceIDMapResource = getResourceIDMapResource(store.getState())
    setIsSaving(true)
    const agentIDMapAgent = getAIAgentIDMapAgent(store.getState())
    const payload: Record<string, { actionID: string; resourceID: string }> = {}
    replaceInfoList.forEach(({ actionIDs, resourceID }) => {
      actionIDs.forEach((actionID) => {
        payload[actionID] = { actionID, resourceID }
      })
    })
    const updateActionList = Object.values(payload)
      .map((item) => {
        return actionIDMapAction[item.actionID]
      })
      .map((action) => {
        if (action.actionType === "aiagent") {
          const newResourceID = payload[action.actionID].resourceID
          return {
            ...action,
            resourceID: newResourceID,
            content: {
              ...action.content,
              virtualResource: agentIDMapAgent[newResourceID],
            },
          }
        }

        const newResourceID = payload[action.actionID].resourceID
        const actionType = resourceIDMapResource[newResourceID].resourceType
        return {
          ...action,
          actionType: actionType,
          resourceID: newResourceID,
        }
      })

    const missingActionIDs = Object.values(missingResourceActionList)
      .map((item) => item.actionIDs)
      .flat()
    track(ILLA_MIXPANEL_EVENT_TYPE.CLICK, {
      element: "missing_resource_configure_modal_save",
      parameter1: missingActionIDs.length === updateActionList.length,
    })

    dispatch(actionActions.batchUpdateActionItemReducer(updateActionList))
    await fetchBatchUpdateAction(updateActionList)

    setIsSaving(false)
  }

  return (
    <>
      <div css={missingListContainerStyle}>
        <header css={columnContainerStyle}>
          <p css={cellStyle("128px")}>
            {t("editor.action.panel.label.missing_resource.affected_actions")}
          </p>
          <p css={cellStyle("64px")}>
            {t("editor.action.panel.label.missing_resource.type")}
          </p>
          <p css={cellStyle("200px")}>
            {t("editor.action.panel.label.missing_resource.replacement")}
          </p>
          <p css={cellStyle("96px")}>
            {t("editor.action.panel.label.missing_resource.status")}
          </p>
          <p css={cellStyle("96px")}>
            {t("editor.action.panel.label.missing_resource.tutorial")}
          </p>
        </header>
        {Object.keys(missingResourceActionList).map((key) => {
          const item = missingResourceActionList[key]
          return (
            <ListItem
              key={key}
              index={key}
              actionIDs={item.actionIDs}
              tutorialHref={item.tutorialHref}
              resourceType={item.resourceType}
              replacementResourceID={replaceInfo.get(key)?.resourceID}
              status={!!replaceInfo.get(key) ? "completed" : "missing"}
              handleChangePlaceInfo={handleChangePlaceInfo}
            />
          )
        })}
      </div>
      <MissingResourceFooter
        handleCancelModal={handleCancelModal}
        handleConfirmModal={handleConfirmModal}
        isSaving={isSaving}
        canSave={replaceInfoList.length > 0}
      />
    </>
  )
}

export default MissingList

import {
  ForwardRefRenderFunction,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { useSelector } from "react-redux"
import { QuestionCircleIcon, getColor } from "@illa-design/react"
import MissingResources from "@/page/App/components/MIssingResources"
import { getHasMissingResourceAction } from "@/redux/currentApp/action/actionSelector"
import { missingButtonStyle } from "./style"

export interface MissingTipButtonMethod {
  changeShown: (shown: boolean) => void
}

export const ResourceMissingTipButton: ForwardRefRenderFunction<
  MissingTipButtonMethod,
  {}
> = (_props, ref) => {
  const hasMissingResources = useSelector(getHasMissingResourceAction)
  const [shown, setShown] = useState(hasMissingResources)

  useEffect(() => {
    setShown(hasMissingResources)
  }, [hasMissingResources])

  useImperativeHandle(ref, () => {
    return {
      changeShown: setShown,
    }
  })

  return (
    hasMissingResources && (
      <>
        <button
          css={missingButtonStyle}
          onClick={() => {
            setShown(true)
          }}
        >
          <QuestionCircleIcon color={getColor("orange", "03")} size="16px" />
          Resource Missing
        </button>
        {shown &&
          createPortal(
            <MissingResources shown={shown} changeShown={setShown} />,
            document.body,
          )}
      </>
    )
  )
}

export default forwardRef(ResourceMissingTipButton)

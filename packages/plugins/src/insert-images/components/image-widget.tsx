import {
  BaseProps,
  COLORS,
  iconClassName,
  IconName,
  OutsideClickHandler,
} from '@blink-mind/renderer-react';
import { useState } from 'react';
import * as React from 'react';
import styled from 'styled-components';
import { TopicImageData } from '../ext-data-images';
import {
  OP_TYPE_DELETE_TOPIC_IMAGE,
  OP_TYPE_MOVE_TOPIC_IMAGE,
  OP_TYPE_SET_TOPIC_IMAGE
} from '../utils';

const Root = styled.div`
  position: relative;
  margin: 5px;
`;

const ImgContainer = styled(OutsideClickHandler)`
  position: relative;
`;

const ResizeIcon = styled.div`
  position: absolute;
  right: -5px;
  top: -5px;
  width: 10px;
  height: 10px;
  cursor: nesw-resize;
  background: ${props => props.theme.highlightColor};
`;

const ResizeImg = styled.img`
  display: block;
  position: absolute;
  left: 0;
  bottom: 0;
  opacity: 0.6;
`;

const Img = styled.img`
  display: block;
  outline-offset: 2px;
  resize: both;
  outline: ${props =>
    props.toolbarVisible && `solid 1px ${props.theme.highlightColor}`};
`;

const EditButtons = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
`;

const EditButton = styled.div`
  margin: 5px;
  //border-radius: 50%;
  width: 24px;
  height: 24px;
  text-align: center;
  vertical-align: middle;
  border: gray 1px solid;
  background: rgba(125, 188, 255, 0.6);
  &:hover {
    cursor: pointer;
    color: ${COLORS.LIGHT.ITEM_BG_ACTIVE};
  }
`;

const ResizePopoverContent = styled.div`
  width: 200px;
  height: 200px;
  background: fuchsia;
`;

interface Props extends BaseProps {
  image: TopicImageData;
  index: number;
  totalCount: number;
}
export function ImageWidget(props: Props) {
  const { image, index, totalCount, ...rest } = props;
  const { controller } = rest;
  const { key: imageKey, url, width, height } = image;
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [tempSize, setTempSize] = useState({ width, height });
  const [status, setStatus] = useState('normal');
  const canMoveUp = index > 0;
  const canMoveDown = index < totalCount - 1;

  const onClickDelete = () => {
    controller.run('operation', {
      ...rest,
      opType: OP_TYPE_DELETE_TOPIC_IMAGE,
      imageKey
    });
  };
  const moveImage = moveDir => {
    controller.run('operation', {
      ...rest,
      opType: OP_TYPE_MOVE_TOPIC_IMAGE,
      imageKey,
      moveDir
    });
  };

  const onClickMoveUp = () => {
    moveImage('up');
  };

  const onClickMoveDown = () => {
    moveImage('down');
  };

  let imageEle, rootEle;
  let resizeSize;
  const imageRef = ref => {
    imageEle = ref;
  };
  const rootRef = ref => {
    rootEle = ref;
  };

  const onImageClick = e => {
    setToolbarVisible(true);
  };

  const onImageOutsideClick = () => {
    setToolbarVisible(false);
  };

  const resizeMouseMove = e => {
    const delta = e.screenX - initMouseX;
    resizeSize = {
      width: width + delta,
      height: height + (delta * height) / width
    };
    setTempSize(resizeSize);
  };
  const resizeMouseUp = e => {
    document.body.style.cursor = null;
    document.removeEventListener('mousemove', resizeMouseMove);
    document.removeEventListener('mouseup', resizeMouseUp);
    setStatus('normal');
    controller.run('operation', {
      ...props,
      opType: OP_TYPE_SET_TOPIC_IMAGE,
      imageKey,
      imageData: { width: resizeSize.width, height: resizeSize.height }
    });
  };
  let initMouseX;
  const prepareResize = e => {
    e.preventDefault();
    e.stopPropagation();
    document.body.style.cursor = 'nesw-resize';
    initMouseX = e.screenX;
    setStatus('resize');
    // console.log('prepareResize setTempSize', width, height);
    // setTempSize({
    //   width,
    //   height
    // });
    document.addEventListener('mousemove', resizeMouseMove);
    document.addEventListener('mouseup', resizeMouseUp);
  };

  const imgProps = {
    src: url,
    width,
    height,
    ref: imageRef,
    toolbarVisible,
    onClick: onImageClick
  };

  const rootProps = {
    ref: rootRef
  };

  const renderResizeImg = () => {
    if (status !== 'resize') return null;
    // console.log('renderResizeImg', tempSize);
    const resizeImgProps = {
      src: url,
      width: tempSize.width,
      height: tempSize.height
    };
    return <ResizeImg {...resizeImgProps} />;
  };

  const renderEditButtons = () => {
    const resizePopoverProps = {
      hasBackdrop: true
    };
    return (
      <>
        <ResizeIcon onMouseDown={prepareResize} />
        <EditButtons>
          {canMoveUp && (
            <EditButton
              className={iconClassName(IconName.MOVE_UP)}
              onClick={onClickMoveUp}
            />
          )}
          {canMoveDown && (
            <EditButton
              className={iconClassName(IconName.MOVE_DOWN)}
              onClick={onClickMoveDown}
            />
          )}

          <EditButton
            className={iconClassName(IconName.TRASH)}
            onClick={onClickDelete}
          />
        </EditButtons>
      </>
    );
  };

  const imgContainerProps = {
    useCapture: false,
    onOutsideClick: onImageOutsideClick
  };

  return (
    <Root {...rootProps}>
      <ImgContainer {...imgContainerProps}>
        <Img {...imgProps} />
        {toolbarVisible && renderEditButtons()}
      </ImgContainer>

      {renderResizeImg()}
    </Root>
  );
}

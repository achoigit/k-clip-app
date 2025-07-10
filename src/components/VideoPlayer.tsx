
import React from 'react';
import YouTube from 'react-youtube';
import { Modal } from 'react-bootstrap';

interface Props {
  show: boolean;
  onHide: () => void;
  videoId: string;
  startTime: number;
  endTime: number;
}

const VideoPlayer: React.FC<Props> = ({ show, onHide, videoId, startTime, endTime }) => {
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
      start: startTime,
      end: endTime,
    },
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Body>
        <YouTube videoId={videoId} opts={opts} />
      </Modal.Body>
    </Modal>
  );
};

export default VideoPlayer;

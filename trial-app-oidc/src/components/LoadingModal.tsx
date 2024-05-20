import { CircularProgress, Modal, ModalProps } from '@mui/material';

const LoadingModal = (props: Omit<ModalProps, 'children'>) => {
  return (
    <Modal
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
      }}
      {...props}>
      <CircularProgress sx={{ outline: 'none' }} />
    </Modal>
  );
};

export default LoadingModal;

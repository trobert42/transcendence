import { IconType } from 'react-icons';

type ButtonUserActionProps = {
  className?: string;
  text?: string;
  onClick?: () => void;
  Icon?: IconType;
  styleIcon?: React.CSSProperties;
};

const ButtonUserAction = ({
  className,
  text,
  onClick,
  Icon,
  styleIcon,
}: ButtonUserActionProps) => (
  <button type="button" className={className} onClick={onClick}>
    <div className="text-wrapper">
      {text}
      {Icon && <Icon style={styleIcon} />}
    </div>
  </button>
);

export default ButtonUserAction;

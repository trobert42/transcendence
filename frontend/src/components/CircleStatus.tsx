
interface Props {
  isLogged?: boolean;
}

export const CircleStatus: React.FC<Props> = ({ isLogged }) => {
  return (
    <>
      {isLogged && (
        <div className="circle-status">
          <div className="circle-connected" />
        </div>
      )}
      {!isLogged && (
        <div className="circle-status">
          <div className="circle-absent" />
        </div>
      )}
    </>
  );
};

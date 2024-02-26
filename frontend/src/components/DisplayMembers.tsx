import {Member} from '../utils/chatClasses';

const MAX_DISPLAY = 3;

const DisplayMembers = ({members}: { members: Member[] }) => {
    if (members.length === 0) {
        return null;
    }

    const displayNames = members.slice(0, MAX_DISPLAY).map((member, index) => (
        <span key={member.id}>
      {member.username}
            {index < MAX_DISPLAY - 1 && index + 1 < members.length && ','}
    </span>
    ));

    const remainingCount = members.length - MAX_DISPLAY;
    const hasRemaining = remainingCount > 0;

    return (
        <p>
            {displayNames}
            {hasRemaining && `, ...`}
        </p>
    );
};

export default DisplayMembers;
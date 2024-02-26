import {Member, Message} from "../utils/chatClasses";
import useAuth from "../hooks/useAuth";

interface MessageBubbleProps {
    members: Member[];
    msg: Message;
    show_sender: boolean;
}

const generateColorFromUsername = (username: string) => {
    const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const h = (seed % 360) / 360;
    const s = 20 / 100;
    const v = 98 / 100;

    const h_i = Math.floor(h * 6);
    const f = h * 6 - h_i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r, g, b;
    if (h_i === 0) {
        r = v;
        g = t;
        b = p;
    } else if (h_i === 1) {
        r = q;
        g = v;
        b = p;
    } else if (h_i === 2) {
        r = p;
        g = v;
        b = t;
    } else if (h_i === 3) {
        r = p;
        g = q;
        b = v;
    } else if (h_i === 4) {
        r = t;
        g = p;
        b = v;
    } else {
        r = v;
        g = p;
        b = q;
    }

    const toHex = (c: number) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return hexColor;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({members, msg, show_sender}) => {
    const author = members.find(mem => mem.id === msg.authorId);
    // eslint-disable-next-line
    const {auth, setAuth}: any = useAuth();

    const isReceived = msg.authorId !== auth.id;
    const messageClass = isReceived ? 'message received' : 'message sent';

    const detectURLs = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, (url) => `<a href="${url}" >${url}</a>`);
    };

    const renderMessageContent = (content: string) => {
        const contentWithLinks = detectURLs(content);
        return <span dangerouslySetInnerHTML={{ __html: contentWithLinks }} />;
    };

    let messageStyle;

    if (isReceived && author != null)
        messageStyle = {backgroundColor: generateColorFromUsername(author.username)};
    else
        messageStyle = {};

    let authorUsername =author?author.username:"Old member";

    return (
        <div className={messageClass} style={messageStyle}>
            <p>
                {isReceived && show_sender && (
                    <>
                        <strong>{authorUsername} :</strong>
                        <br/> {/* Saut de ligne */}
                    </>
                )}
                {renderMessageContent(msg.content)}
            </p>
        </div>
    )
}

export default MessageBubble;
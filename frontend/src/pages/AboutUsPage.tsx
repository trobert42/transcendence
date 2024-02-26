import Menu from '../components/Menu';
import { FlippingCard } from '../components/FlippingCard';

const AboutUsPage = () => {
  return (
    <div className="page">
      <div className="main-container">
        <div className="div-transparent"></div>
        <div className="main-container-element">
          <div>
            <p className="text-title-h1">Who are we?</p>
          </div>
          <div className="flex-row wrap">
            <FlippingCard name="agras" citation="La creme de la creme" />
            <FlippingCard name="chillion" citation="La cerise sur le gateau" />
            <FlippingCard name="eleotard" citation="La douceur suprême" />
            <FlippingCard name="plefevre" citation="Le clou du spectacle" />
            <FlippingCard name="trobert" citation="La symphonie des papilles" />
            {/* <FlippingCard name="secretmember" citation="" /> */}
          </div>
        </div>
      </div>
      <Menu />
    </div>
  );
};

export default AboutUsPage;

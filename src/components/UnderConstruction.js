import constructionImg from "../assets/construction.png";

function UnderConstruction({ pageName }) {
  return (
    <div className="construction-card">
      <h2>{pageName}</h2>
      <p>This page is currently under construction.</p>
      <img
        src={constructionImg}
        alt="Under Construction"
        className="construction-img"
      />
    </div>
  );
}

export default UnderConstruction;
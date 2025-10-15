const Footer = (props) => {
  return (
    <>
      <footer
        className="text-center pt-5 pb-5 mt-4 shadow"
        style={{ backgroundColor: "var(--white-color)" }}
      >
        <div className="footer-container container">
          <span style={{ color: "var(--primary-color)" }}>
            Sandro Seivane &copy; {new Date().getFullYear()} EventHive
          </span>
        </div>
      </footer>
    </>
  );
};

Footer.propTypes = {};

export default Footer;

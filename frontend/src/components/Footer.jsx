import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white py-6 mt-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Universidade Fictícia. Todos os direitos reservados.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="/politica-privacidade" className="hover:underline text-sm">Política de Privacidade</a>
          <a href="/termos-uso" className="hover:underline text-sm">Termos de Uso</a>
          <a href="/contato" className="hover:underline text-sm">Contato</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

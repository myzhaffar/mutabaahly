import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {item.href && index < items.length - 1 ? (
              <div className="flex items-center">
                <Link
                  to={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  {item.label}
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-500">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 
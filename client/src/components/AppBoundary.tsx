import React from 'react';

class AppBoundary extends React.Component<any, {hasError:boolean}> {
  state = { hasError:false };
  static getDerivedStateFromError(){ return { hasError:true }; }
  componentDidCatch(e:any,i:any){ console.error("UI crash:", e, i); }
  render(){ return this.state.hasError ? <div>Something went wrong.</div> : this.props.children; }
}

export default AppBoundary;

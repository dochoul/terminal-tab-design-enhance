import { h, Component } from 'preact';

interface Tab {
  id: number;
  title: string;
}

interface Props {
  tabs: Tab[];
  activeTabId: number;
  onTabClick: (id: number) => void;
  onNewTab: () => void;
  onCloseTab: (id: number) => void;
}

export class Tabs extends Component<Props> {
  private listRef: HTMLElement;
  private trackRef: HTMLElement;
  private thumbRef: HTMLElement;
  private dragging = false;
  private dragStartX = 0;
  private dragStartScroll = 0;

  componentDidMount() {
    this.listRef?.addEventListener('wheel', this.onWheel, { passive: false });
    this.listRef?.addEventListener('scroll', this.updateThumb);
    window.addEventListener('resize', this.updateThumb);
    window.addEventListener('mousemove', this.onDragMove);
    window.addEventListener('mouseup', this.onDragEnd);
    this.updateThumb();
  }

  componentDidUpdate() {
    this.updateThumb();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateThumb);
    window.removeEventListener('mousemove', this.onDragMove);
    window.removeEventListener('mouseup', this.onDragEnd);
  }

  onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      this.listRef.scrollLeft += e.deltaY;
    }
  };

  updateThumb = () => {
    const list = this.listRef;
    const thumb = this.thumbRef;
    const track = this.trackRef;
    if (!list || !thumb || !track) return;

    const { scrollLeft, scrollWidth, clientWidth } = list;
    if (scrollWidth <= clientWidth) {
      track.style.display = 'none';
      return;
    }
    track.style.display = 'block';
    const ratio = clientWidth / scrollWidth;
    const thumbWidth = Math.max(ratio * clientWidth, 30);
    const maxScroll = scrollWidth - clientWidth;
    const maxThumbLeft = clientWidth - thumbWidth;
    const thumbLeft = maxScroll > 0 ? (scrollLeft / maxScroll) * maxThumbLeft : 0;

    thumb.style.width = `${thumbWidth}px`;
    thumb.style.left = `${thumbLeft}px`;
  };

  onThumbDown = (e: MouseEvent) => {
    e.preventDefault();
    this.dragging = true;
    this.dragStartX = e.clientX;
    this.dragStartScroll = this.listRef.scrollLeft;
    this.thumbRef.classList.add('active');
  };

  onDragMove = (e: MouseEvent) => {
    if (!this.dragging) return;
    const list = this.listRef;
    const { scrollWidth, clientWidth } = list;
    const ratio = clientWidth / scrollWidth;
    const thumbWidth = Math.max(ratio * clientWidth, 30);
    const maxThumbLeft = clientWidth - thumbWidth;
    const maxScroll = scrollWidth - clientWidth;
    const dx = e.clientX - this.dragStartX;
    const scrollDelta = maxThumbLeft > 0 ? (dx / maxThumbLeft) * maxScroll : 0;
    list.scrollLeft = this.dragStartScroll + scrollDelta;
  };

  onDragEnd = () => {
    if (!this.dragging) return;
    this.dragging = false;
    this.thumbRef?.classList.remove('active');
  };

  onTrackClick = (e: MouseEvent) => {
    if (e.target === this.thumbRef) return;
    const list = this.listRef;
    const track = this.trackRef;
    const rect = track.getBoundingClientRect();
    const clickRatio = (e.clientX - rect.left) / rect.width;
    list.scrollLeft = clickRatio * (list.scrollWidth - list.clientWidth);
  };

  render({ tabs, activeTabId, onTabClick, onNewTab, onCloseTab }: Props) {
    return (
      <div class="tabs-container">
        <div class="tabs-list" ref={c => { this.listRef = c as HTMLElement; }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              class={`tab ${tab.id === activeTabId ? 'tab-active' : ''}`}
              onClick={() => onTabClick(tab.id)}
            >
              <span class="tab-title">{tab.title}</span>
              <span class="tab-close" onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}>
                ×
              </span>
            </div>
          ))}
        </div>
        <button class="tab-new" onClick={onNewTab}>+</button>
        <div
          class="tabs-scrollbar-track"
          ref={c => { this.trackRef = c as HTMLElement; }}
          onClick={this.onTrackClick}
        >
          <div
            class="tabs-scrollbar-thumb"
            ref={c => { this.thumbRef = c as HTMLElement; }}
            onMouseDown={this.onThumbDown}
          />
        </div>
      </div>
    );
  }
}

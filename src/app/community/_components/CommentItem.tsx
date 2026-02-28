interface Props {
  comment: any;
}

export default function CommentItem({ comment }: Props) {
  return (
    <div className="bg-background border border-border-subtle rounded-xl p-3">
      <h4 className="text-sm font-semibold text-primary">
        {comment.author}
      </h4>
      <p className="text-sm text-text-primary mt-1">
        {comment.content}
      </p>
      <p className="text-xs text-text-muted mt-1">
        {comment.time}
      </p>
    </div>
  );
}
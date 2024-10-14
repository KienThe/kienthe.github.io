const Overlay: React.FC = () => {
  // const dispatch = useAppDispatch();
  // const boardSize = useAppSelector((state) => state.app.boardSize);
  // const reset = useCallback(
  //   () => dispatch(resetAction(boardSize)),
  //   [dispatch, boardSize],
  // );
  // const dismiss = useCallback(() => dispatch(dismissAction()), [dispatch]);

  // const defeat = useAppSelector((state) => state.app.defeat);
  // const victory = useAppSelector(
  //   (state) => state.app.victory && !state.app.victoryDismissed,
  // );

  if (true) {
    return (
      <div className="z-999 absolute bottom-0 left-0 right-0 top-0 flex flex-col justify-center bg-[#EEE4DA] bg-opacity-80 text-center align-middle">
        <h1 className="text-2xl font-bold">You win!</h1>
        <div className="flex justify-center gap-2">
          <button
          // onClick={dismiss}
          >
            Keep going
          </button>
          <button
          // onClick={reset}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (true) {
    return (
      <div className="z-999 absolute bottom-0 left-0 right-0 top-0 flex flex-col justify-center bg-[#f08437] bg-opacity-50 text-center align-middle">
        <h1 className="text-2xl font-bold">Game over!</h1>
        <div>
          <button
            //  onClick={reset}
            className="opacity-100"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return null
}

export { Overlay }
